# Publish Blog Post from Markdown

Publish a blog post to DxPress by reading a markdown file and calling the API.

## Instructions

You are a blog publishing assistant. The user will provide a path to a markdown file. Your job is to parse it and create a post via the DxPress API.

### Step 1: Read the markdown file

Read the file the user specified: $ARGUMENTS

If no file path was provided, ask the user for the path to the markdown file.

### Step 2: Parse front matter

The markdown file should have YAML front matter like:

```markdown
---
title: "My Blog Post"
tags: ["nextjs", "typescript"]
coverImage: "/path/to/image.jpg"
published: true
excerpt: "Optional custom excerpt"
---

Blog content here...
```

Required fields: `title`
Optional fields: `tags`, `coverImage`, `published` (default: false), `excerpt`

Use the content after the front matter as the post body. If no `excerpt` is provided, generate one from the first ~160 characters of content (strip markdown formatting).

If the file has no front matter (no `---` delimiters), treat the first `# Heading` as the title and everything after as content.

### Step 3: Load credentials from environment

Read the file `/home/jpdev/source/wordpressClone/.env.publish` to get:
- `DXPRESS_EMAIL` — admin email
- `DXPRESS_PASSWORD` — admin password
- `DXPRESS_API_URL` — base URL (e.g., `http://localhost:3000`)

If `.env.publish` doesn't exist, check `.env.local` for the same variables. If neither exists, ask the user for credentials.

### Step 4: Authenticate with NextAuth

**IMPORTANT**: Use Python `urllib` for the entire auth flow. Curl does not reliably handle NextAuth's cookie/session management. All subsequent API calls should also use the same Python opener with the cookie jar.

```python
import urllib.request
import urllib.parse
import json
import http.cookiejar

# Setup cookie jar
cj = http.cookiejar.MozillaCookieJar('/tmp/dxpress-cookies.txt')
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# Step 1: Get CSRF token
req = urllib.request.Request(f"{DXPRESS_API_URL}/api/auth/csrf")
resp = opener.open(req)
csrf_token = json.loads(resp.read().decode())['csrfToken']

# Step 2: Sign in
data = urllib.parse.urlencode({
    'csrfToken': csrf_token,
    'email': DXPRESS_EMAIL,
    'password': DXPRESS_PASSWORD,
    'redirect': 'false',
    'json': 'true',
    'callbackUrl': f'{DXPRESS_API_URL}/admin'
}).encode('utf-8')

req = urllib.request.Request(
    f"{DXPRESS_API_URL}/api/auth/callback/credentials",
    data=data,
    headers={'Content-Type': 'application/x-www-form-urlencoded'},
    method='POST'
)
resp = opener.open(req)

# Save cookies
cj.save(ignore_discard=True, ignore_expires=True)

# Step 3: Verify session
req = urllib.request.Request(f"{DXPRESS_API_URL}/api/auth/session")
resp = opener.open(req)
session = json.loads(resp.read().decode())
# session should contain user data, not {}
```

After sign-in, reuse the same `opener` for all subsequent requests — it carries the session cookies automatically. For all API calls (tags, upload, post creation), use the Python opener, not curl.

### Step 5: Resolve tags

If the markdown specifies tags, use the Python opener from Step 4:

1. Fetch existing tags:
```python
req = urllib.request.Request(f"{DXPRESS_API_URL}/api/tags")
resp = opener.open(req)
existing_tags = json.loads(resp.read().decode())
```

2. For each tag in the front matter, check if it already exists (match by name, case-insensitive).

3. Create any missing tags:
```python
payload = json.dumps({"name": "tag-name"}).encode('utf-8')
req = urllib.request.Request(
    f"{DXPRESS_API_URL}/api/tags",
    data=payload,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = opener.open(req)
new_tag = json.loads(resp.read().decode())
```

4. Collect all tag IDs for the post creation step.

### Step 6: Handle cover image (if local file)

If `coverImage` is a local file path (not a URL):

1. Get a presigned upload URL:
```python
payload = json.dumps({"filename": "image.jpg", "contentType": "image/jpeg"}).encode('utf-8')
req = urllib.request.Request(
    f"{DXPRESS_API_URL}/api/upload",
    data=payload,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = opener.open(req)
upload_data = json.loads(resp.read().decode())
```

2. Upload the file to the presigned URL (curl is fine for binary uploads):
```bash
curl -s -X PUT \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/image.jpg \
  "$PRESIGNED_URL"
```

3. Use the `publicUrl` from step 1 as the `coverImage` value.

If `coverImage` is already a URL, use it as-is.

### Step 7: Create the post

Use the Python opener from Step 4:

```python
post_data = {
    "title": "Post Title",
    "content": "markdown content...",
    "excerpt": "excerpt text",
    "coverImage": "https://...",
    "published": True,
    "tagIds": ["id1", "id2"]
}
payload = json.dumps(post_data).encode('utf-8')
req = urllib.request.Request(
    f"{DXPRESS_API_URL}/api/posts",
    data=payload,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = opener.open(req)
result = json.loads(resp.read().decode())
```

### Step 8: Report results

After creating the post, display:
- Post title and slug
- Published status (draft or published)
- Tags applied
- Post URL: `$DXPRESS_API_URL/blog/{slug}`
- Any errors encountered

### Step 9: Clean up

```bash
rm -f /tmp/dxpress-cookies.txt
```

## Error Handling

- If authentication fails, report the error and suggest checking credentials in `.env.publish`
- If a post with the same title already exists (409), ask the user if they want to update it instead
- If tag creation fails, continue with available tags and report which ones failed
- If image upload fails, create the post without the cover image and report the issue
