<objective>
Build the complete content system and all public-facing pages for the developer portfolio. This includes the blog with code highlighting, project showcase, resume page, about page, and home page — all pulling content from the PostgreSQL database via Prisma.

The site must look clean, professional, and impressive — this is selling the owner as an expert developer. Every page should feel polished, not like a template.
</objective>

<context>
Prompt 001 has already been executed. The project has:
- Next.js 14+ with App Router, TypeScript, Tailwind CSS
- Prisma schema with Post, Tag, Project, Resume, SiteConfig models
- PostgreSQL via Docker Compose
- NextAuth.js with admin route protection
- Base layout with responsive Header, Footer, ThemeProvider
- All route placeholder files exist
- Dependencies installed: next-mdx-remote, rehype-pretty-code, shiki, remark-gfm, @tailwindcss/typography, lucide-react, date-fns

Read CLAUDE.md for project conventions.
Examine the existing codebase structure before making changes — build on what prompt 001 created.
</context>

<requirements>
Deeply consider the user experience of each page and implement the following:

### 1. Markdown/MDX Rendering System

Create a reusable MDX rendering component (`components/mdx/MdxContent.tsx`):
- Uses `next-mdx-remote/rsc` to render markdown strings from the database as rich HTML
- Configured with:
  - `rehype-pretty-code` with Shiki for syntax highlighting (use "one-dark-pro" theme for dark mode, "github-light" for light mode)
  - `remark-gfm` for tables, strikethrough, task lists
  - `rehype-slug` + `rehype-autolink-headings` for clickable heading anchors
- Custom MDX components that override default HTML elements:
  - Code blocks: styled container with language label, copy button, line numbers
  - Inline code: subtle background highlight
  - Images: responsive with lazy loading
  - Links: external links open in new tab with icon
  - Blockquotes: styled with left border accent
  - Tables: responsive with horizontal scroll on mobile
- The prose styling should use Tailwind Typography (`prose` classes) with custom overrides for the portfolio's design

### 2. Home Page (`app/page.tsx`)

Professional landing page with sections:
- **Hero**: Owner name, title (e.g., "Senior Full-Stack Developer"), short bio, CTA buttons (View Projects, Read Blog), professional avatar/photo placeholder
- **Featured Projects**: Grid of 3-4 featured projects (from database, `featured: true`), each as a card with cover image, title, tech stack badges, brief description, links to GitHub and live demo
- **Recent Blog Posts**: Latest 3 published posts with title, date, excerpt, read time estimate, tags
- **Skills/Tech Stack**: Visual grid or categorized list of technologies (could be from SiteConfig or hardcoded initially)
- **Call to Action**: Contact section with links to GitHub, LinkedIn, email

All sections should pull real data from the database. Use Server Components for data fetching.

### 3. Blog System

**Blog listing page** (`app/blog/page.tsx`):
- Grid/list of all published posts, newest first
- Each post card shows: cover image, title, date, excerpt, reading time, tags
- Filter by tag (via URL params: `/blog?tag=react`)
- Pagination (10 posts per page)
- Clean typography and spacing

**Individual blog post** (`app/blog/[slug]/page.tsx`):
- Full post rendered via MdxContent component
- Post header: title, publish date, reading time, author, tags
- Cover image (full-width or contained)
- Table of contents sidebar (generated from headings) — sticky on desktop, collapsible on mobile
- Previous/Next post navigation at bottom
- Code blocks must look professional with:
  - Syntax highlighting (multiple languages)
  - Language label in top-right corner
  - Copy-to-clipboard button
  - Line numbers (optional, enabled via meta string)
  - Line highlighting (enabled via meta string, e.g., ```js {1,3-5})

### 4. Projects Showcase

**Projects listing** (`app/projects/page.tsx`):
- Grid of project cards with hover effects
- Each card: cover image/screenshot, title, description, tech stack as badges, GitHub + live links
- Featured projects highlighted at top
- Filter by technology (from techStack array)

**Individual project** (`app/projects/[slug]/page.tsx`):
- Full project detail with MDX-rendered content (supports markdown write-up about the project)
- Project metadata sidebar: tech stack, links, date
- Screenshots/gallery if applicable
- Back to projects link

### 5. Resume Page (`app/resume/page.tsx`)

- Renders the Resume model's markdown content via MdxContent
- Clean, professional formatting that looks like a proper resume/CV
- Download as PDF button (link to a stored PDF or use browser print-to-PDF styling)
- Sections the markdown should support: Summary, Experience, Education, Skills, Certifications
- Print-friendly CSS (`@media print` styles)

### 6. About Page (`app/about/page.tsx`)

- Professional bio section with photo
- Skills and expertise
- Contact information / ways to connect
- Social links (GitHub, LinkedIn, Twitter, email)
- Optional: timeline of career highlights

### 7. Prisma Data Access Layer

Create organized data access functions in `lib/data/`:
- `lib/data/posts.ts` — getPublishedPosts, getPostBySlug, getPostsByTag, getRecentPosts, getAdjacentPosts
- `lib/data/projects.ts` — getProjects, getFeaturedProjects, getProjectBySlug
- `lib/data/resume.ts` — getResume
- `lib/data/site-config.ts` — getSiteConfig
- `lib/data/tags.ts` — getAllTags, getTagBySlug

All functions use the Prisma client singleton. Include proper TypeScript return types.

### 8. Seed Data

Create `prisma/seed.ts`:
- Seed a SiteConfig with realistic developer profile data
- Seed 4-6 sample blog posts with REAL markdown content including code blocks in multiple languages (TypeScript, Python, SQL, bash). Posts should look like actual technical blog articles — not lorem ipsum.
- Seed 4-5 sample projects with descriptions, tech stacks, and GitHub URL placeholders
- Seed a sample resume in markdown format
- Seed 8-10 tags (React, TypeScript, Node.js, AWS, PostgreSQL, etc.)
- Configure in package.json: `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }`

### 9. Utility Functions

In `lib/utils.ts`:
- `calculateReadingTime(content: string): number` — estimate reading time from word count
- `formatDate(date: Date): string` — human-readable date formatting
- `generateExcerpt(content: string, maxLength?: number): string` — strip markdown and truncate
- `cn(...classes)` — Tailwind class merging utility (use `clsx` + `tailwind-merge`)

Install `clsx` and `tailwind-merge` if not already installed.
</requirements>

<constraints>
- Maximum 300 lines per file — split into modules if needed
- All pages use Server Components for data fetching — no client-side fetch for initial page loads
- "use client" only for interactive elements (copy button, mobile TOC toggle, tag filter)
- Code blocks MUST have proper syntax highlighting — this is critical for a developer portfolio
- No mock data in components — all data comes from database via Prisma
- Responsive design: all pages must look great on mobile, tablet, and desktop
- Do NOT add admin CRUD pages yet — that comes separately
- Keep the design consistent across all pages — use shared component patterns
</constraints>

<output>
Key files to create/modify:
- `./components/mdx/MdxContent.tsx` — core MDX renderer
- `./components/mdx/CodeBlock.tsx` — custom code block with copy button
- `./components/mdx/mdx-components.tsx` — custom element overrides
- `./components/blog/PostCard.tsx` — blog post card for listings
- `./components/blog/TableOfContents.tsx` — sticky TOC sidebar
- `./components/blog/PostNavigation.tsx` — prev/next post links
- `./components/projects/ProjectCard.tsx` — project card for listings
- `./components/ui/Badge.tsx` — tech stack / tag badges
- `./components/ui/Pagination.tsx` — pagination component
- `./app/page.tsx` — home page (replace placeholder)
- `./app/blog/page.tsx` — blog listing
- `./app/blog/[slug]/page.tsx` — individual post
- `./app/projects/page.tsx` — projects listing
- `./app/projects/[slug]/page.tsx` — individual project
- `./app/resume/page.tsx` — resume
- `./app/about/page.tsx` — about page
- `./lib/data/*.ts` — data access functions
- `./prisma/seed.ts` — seed data

After creating all files:
1. Run `docker compose up -d` to start PostgreSQL
2. Run `npx prisma migrate dev --name init` to create tables
3. Run `npx prisma db seed` to seed sample data
4. Run `npm run build` to verify everything compiles
5. Fix any errors before completing
</output>

<verification>
Before declaring complete, verify:
1. `npm run build` succeeds with zero errors
2. Database is seeded with sample data
3. Home page renders with featured projects and recent posts from the database
4. Blog listing shows all published posts with proper formatting
5. Individual blog posts render markdown with working syntax highlighting for code blocks
6. Code blocks have: syntax colors, language label, copy button
7. Projects page shows all projects with tech stack badges
8. Resume page renders markdown content professionally
9. All pages are responsive (check at mobile/tablet/desktop widths)
10. Tag filtering works on blog page
11. Table of contents generates correctly from blog post headings
</verification>

<success_criteria>
- All public pages render real data from PostgreSQL
- Blog posts with code blocks display professional syntax highlighting with copy-to-clipboard
- MDX rendering handles all common markdown elements beautifully
- The site looks like a professional developer portfolio, not a template
- Responsive on all screen sizes
- `npm run build` passes cleanly
- Seed data makes the site look populated and realistic
</success_criteria>
