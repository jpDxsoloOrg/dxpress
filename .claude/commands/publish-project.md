# Publish Project from Markdown

Create a project on DxPress by reading a markdown file and calling the API.

## Instructions

You are a project publishing assistant. The user will provide a path to a markdown file. Your job is to parse it and create a project via the DxPress API.

### Step 1: Read the markdown file

Read the file the user specified: $ARGUMENTS

If no file path was provided, ask the user for the path to the markdown file.

### Step 2: Parse front matter

The markdown file should have YAML front matter like:

```markdown
---
title: "My Project"
description: "A short description of the project"
techStack: ["Next.js", "TypeScript", "PostgreSQL"]
githubUrl: "https://github.com/user/repo"
liveUrl: "https://myproject.com"
coverImage: "/path/to/image.jpg"
featured: true
sortOrder: 1
---

Full project content in markdown...
```

Required fields: `title`, `description`
Optional fields: `techStack` (default: []), `githubUrl`, `liveUrl`, `coverImage`, `featured` (default: false), `sortOrder` (default: 0)

Use the content after the front matter as the project content. If no `description` is provided but content exists, generate a description from the first ~160 characters of content (strip markdown formatting).

If the file has no front matter (no `---` delimiters), treat the first `# Heading` as the title, the first paragraph as the description, and everything after as content.

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

After sign-in, reuse the same `opener` for all subsequent requests — it carries the session cookies automatically. For all API calls (upload, project creation), use the Python opener, not curl.

### Step 5: Handle cover image (if local file)

If `coverImage` is a local file path (not a URL), use the Python opener from Step 4:

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

### Step 6: Create the project

Use the Python opener from Step 4:

```python
project_data = {
    "title": "Project Title",
    "description": "Short description",
    "content": "full markdown content...",
    "coverImage": "https://...",
    "githubUrl": "https://github.com/...",
    "liveUrl": "https://...",
    "techStack": ["Next.js", "TypeScript"],
    "featured": True,
    "sortOrder": 1
}
payload = json.dumps(project_data).encode('utf-8')
req = urllib.request.Request(
    f"{DXPRESS_API_URL}/api/projects",
    data=payload,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = opener.open(req)
result = json.loads(resp.read().decode())
```

### Step 7: Report results

After creating the project, display:
- Project title and slug
- Description
- Tech stack
- Featured status
- GitHub and live URLs (if provided)
- Project URL: `$DXPRESS_API_URL/projects/{slug}`
- Any errors encountered

### Step 8: Clean up

```bash
rm -f /tmp/dxpress-cookies.txt
```

## Error Handling

- If authentication fails, report the error and suggest checking credentials in `.env.publish`
- If a project with the same title already exists (409), ask the user if they want to update it instead
- If image upload fails, create the project without the cover image and report the issue
