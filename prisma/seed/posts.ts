export const postsData = [
  {
    title: "Building Type-Safe APIs with tRPC and Next.js",
    slug: "building-type-safe-apis-trpc-nextjs",
    excerpt: "How to create end-to-end type-safe APIs using tRPC, eliminating the need for manual type definitions between your frontend and backend.",
    tags: ["typescript", "nextjs", "react"],
    publishedAt: new Date("2025-12-15"),
    content: `
Type safety across the full stack has always been a challenge. You define types on the backend, then manually recreate them on the frontend. When the API changes, your frontend types drift out of sync. tRPC solves this elegantly.

## What is tRPC?

tRPC lets you build fully type-safe APIs without schemas or code generation. The types flow directly from your backend router to your frontend client.

## Setting Up the Router

First, define your application router with procedures:

\`\`\`typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
      });
      return user;
    }),

  createPost: t.procedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string(),
      published: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      return db.post.create({ data: input });
    }),
});

export type AppRouter = typeof appRouter;
\`\`\`

## Client-Side Usage

On the frontend, you get full autocompletion and type checking:

\`\`\`typescript
import { trpc } from '../utils/trpc';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = trpc.getUser.useQuery({ id: userId });

  if (isLoading) return <Skeleton />;

  // TypeScript knows the exact shape of 'user' here
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
\`\`\`

## Error Handling

tRPC provides structured error handling that also carries type information:

\`\`\`typescript
import { TRPCError } from '@trpc/server';

const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }
  return next({ ctx: { user: ctx.session.user } });
});
\`\`\`

## Why This Matters

The real power is in the developer experience. Change a field name on the backend, and TypeScript immediately flags every frontend file that references the old name. No runtime surprises, no stale types, no API documentation to keep in sync.

For teams shipping fast, this kind of safety net is invaluable.
`,
  },
  {
    title: "PostgreSQL Performance: Indexing Strategies That Actually Work",
    slug: "postgresql-indexing-strategies",
    excerpt: "A practical guide to PostgreSQL indexing beyond CREATE INDEX. Covering partial indexes, expression indexes, and GIN indexes for JSON data.",
    tags: ["postgresql", "architecture"],
    publishedAt: new Date("2025-11-28"),
    content: `
Most developers know they need indexes, but few understand *which* indexes to create and *why*. After years of tuning production PostgreSQL databases, here are the strategies that deliver real results.

## Understanding Query Plans

Before adding any index, look at the query plan:

\`\`\`sql
EXPLAIN ANALYZE
SELECT id, title, published_at
FROM posts
WHERE published = true
  AND published_at > NOW() - INTERVAL '30 days'
ORDER BY published_at DESC
LIMIT 20;
\`\`\`

The output tells you whether PostgreSQL is doing a sequential scan (bad for large tables) or using an index scan (good).

## Partial Indexes: Index Only What You Query

If you only query published posts, do not index unpublished ones:

\`\`\`sql
CREATE INDEX idx_posts_published_date
ON posts (published_at DESC)
WHERE published = true;
\`\`\`

This index is smaller, faster to update, and faster to scan. On a table with 100k rows where only 10k are published, the index is 90% smaller.

## Composite Index Column Order

Column order in composite indexes matters enormously. The rule: put equality conditions first, then range conditions.

\`\`\`sql
-- Good: equality (status) before range (created_at)
CREATE INDEX idx_orders_status_date
ON orders (status, created_at DESC);

-- This query uses the index efficiently:
SELECT * FROM orders
WHERE status = 'pending'
  AND created_at > '2025-01-01'
ORDER BY created_at DESC;
\`\`\`

## GIN Indexes for JSONB

If you store semi-structured data in JSONB columns, GIN indexes are essential:

\`\`\`sql
-- Index the entire JSONB column
CREATE INDEX idx_events_metadata
ON events USING GIN (metadata);

-- Now this query is fast:
SELECT * FROM events
WHERE metadata @> '{"type": "purchase", "source": "web"}';
\`\`\`

## Expression Indexes

Need to query by a computed value? Index the expression directly:

\`\`\`sql
CREATE INDEX idx_users_email_lower
ON users (LOWER(email));

-- This query now uses the index:
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
\`\`\`

## Monitoring Index Usage

Always check which indexes are actually being used:

\`\`\`sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
\`\`\`

Unused indexes waste disk space and slow down writes. Drop them.

## Key Takeaways

1. Always check \`EXPLAIN ANALYZE\` before and after adding indexes
2. Use partial indexes to reduce index size
3. Put equality columns before range columns in composite indexes
4. Use GIN for JSONB queries
5. Drop unused indexes regularly
`,
  },
  {
    title: "Docker Multi-Stage Builds for Node.js Applications",
    slug: "docker-multi-stage-builds-nodejs",
    excerpt: "Reduce your Docker image size by 80% with multi-stage builds. A step-by-step guide for production-ready Node.js containers.",
    tags: ["docker", "nodejs", "devops"],
    publishedAt: new Date("2025-11-10"),
    content: `
I recently shrank a Node.js Docker image from 1.2GB to 180MB. The secret? Multi-stage builds. Here is exactly how to do it.

## The Problem

A typical Dockerfile for a Node.js app looks like this:

\`\`\`dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

This image includes the full Node.js installation, all dev dependencies, source files, build tools, and npm cache. In production, you need none of that.

## Multi-Stage Solution

Split the build into stages. Each stage starts fresh, and you only copy what you need:

\`\`\`dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

## Why This Works

The final image contains only:
- The Alpine-based Node.js runtime (minimal)
- Production \`node_modules\` (no dev dependencies)
- The compiled \`dist/\` output
- A non-root user for security

## Adding a Health Check

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
\`\`\`

## Build and Size Comparison

\`\`\`bash
# Build the optimized image
docker build -t myapp:optimized .

# Check the size
docker images myapp
# REPOSITORY   TAG         SIZE
# myapp        optimized   182MB
# myapp        naive        1.2GB
\`\`\`

That is an 85% reduction in image size, which means faster pulls, less bandwidth, and a smaller attack surface.
`,
  },
  {
    title: "React Server Components: What Changes and What Stays the Same",
    slug: "react-server-components-guide",
    excerpt: "A practical breakdown of React Server Components. When to use them, when to reach for client components, and how to think about the boundary.",
    tags: ["react", "nextjs", "typescript"],
    publishedAt: new Date("2025-10-22"),
    content: `
React Server Components (RSC) represent the biggest shift in React architecture since hooks. After shipping several production apps with them, here is what I have learned.

## The Mental Model

Think of it as two React runtimes:

- **Server Components** run on the server. They can access databases, file systems, and secrets directly. They send rendered HTML to the client, not JavaScript.
- **Client Components** run in the browser. They handle interactivity: state, effects, event handlers, browser APIs.

## When to Use Server Components

Use server components (the default in Next.js App Router) when:

\`\`\`typescript
// This component has ZERO JavaScript sent to the browser
async function RecentPosts() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  return (
    <section>
      <h2>Recent Posts</h2>
      {posts.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </section>
  );
}
\`\`\`

This fetches data, renders HTML, and sends it to the client. No loading spinners, no client-side fetch, no state management.

## When to Use Client Components

Add \`"use client"\` when you need interactivity:

\`\`\`typescript
"use client";

import { useState } from 'react';

function SearchFilter({ initialPosts }: { initialPosts: Post[] }) {
  const [query, setQuery] = useState('');

  const filtered = initialPosts.filter(post =>
    post.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search posts..."
      />
      {filtered.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
\`\`\`

## The Composition Pattern

The key insight is that server components can render client components, but not the other way around. This leads to a powerful pattern:

\`\`\`typescript
// Server Component: fetches data
async function PostsPage() {
  const posts = await db.post.findMany({ where: { published: true } });
  const tags = await db.tag.findMany();

  return (
    <div>
      <h1>Blog</h1>
      {/* Pass server data to client component */}
      <PostsWithFilter posts={posts} tags={tags} />
    </div>
  );
}
\`\`\`

The server component handles data fetching. The client component handles user interaction. Clean separation.

## Common Mistakes

1. **Marking too many components as client components.** Start with server components and only add \`"use client"\` when you actually need interactivity.

2. **Trying to use hooks in server components.** No \`useState\`, \`useEffect\`, or \`useContext\` in server components.

3. **Passing non-serializable props.** Everything passed from a server to client component must be serializable (no functions, classes, or Dates without conversion).

## The Bottom Line

RSC is not about replacing client-side React. It is about using the server where it makes sense and the client where it makes sense. Most of your UI is probably static or data-driven. Render that on the server. Add client interactivity only where users need it.
`,
  },
  {
    title: "Writing a CLI Tool in Python with Click and Rich",
    slug: "python-cli-tool-click-rich",
    excerpt: "Build beautiful, user-friendly command-line tools using Python's Click framework and Rich library for terminal output formatting.",
    tags: ["python", "devops"],
    publishedAt: new Date("2025-10-05"),
    content: `
Command-line tools are one of the most satisfying things to build. With Python's Click and Rich libraries, you can create tools that are both powerful and pleasant to use.

## Project Setup

\`\`\`bash
mkdir mycli && cd mycli
python -m venv venv
source venv/bin/activate
pip install click rich httpx
\`\`\`

## Basic Command Structure

Click uses decorators to define commands:

\`\`\`python
import click
from rich.console import Console
from rich.table import Table

console = Console()

@click.group()
@click.version_option(version="1.0.0")
def cli():
    """A developer utility CLI tool."""
    pass

@cli.command()
@click.argument("name")
@click.option("--greeting", "-g", default="Hello", help="Custom greeting")
def greet(name: str, greeting: str):
    """Greet a user by name."""
    console.print(f"[bold green]{greeting}[/], {name}! :wave:")

if __name__ == "__main__":
    cli()
\`\`\`

## Adding Rich Output

Rich makes terminal output beautiful with minimal effort:

\`\`\`python
@cli.command()
@click.option("--format", "-f", type=click.Choice(["table", "json"]), default="table")
def status(format: str):
    """Show system status."""
    services = [
        {"name": "API", "status": "running", "uptime": "14d 3h"},
        {"name": "Database", "status": "running", "uptime": "14d 3h"},
        {"name": "Cache", "status": "degraded", "uptime": "2h 15m"},
        {"name": "Worker", "status": "stopped", "uptime": "0s"},
    ]

    if format == "json":
        console.print_json(data=services)
        return

    table = Table(title="Service Status")
    table.add_column("Service", style="cyan")
    table.add_column("Status")
    table.add_column("Uptime", style="dim")

    status_colors = {
        "running": "[green]running[/green]",
        "degraded": "[yellow]degraded[/yellow]",
        "stopped": "[red]stopped[/red]",
    }

    for svc in services:
        table.add_row(
            svc["name"],
            status_colors.get(svc["status"], svc["status"]),
            svc["uptime"],
        )

    console.print(table)
\`\`\`

## Progress Bars for Long Operations

\`\`\`python
import time
from rich.progress import Progress

@cli.command()
@click.argument("count", type=int, default=100)
def process(count: int):
    """Process items with a progress bar."""
    with Progress() as progress:
        task = progress.add_task("[cyan]Processing...", total=count)
        for _ in range(count):
            time.sleep(0.02)
            progress.update(task, advance=1)

    console.print(f"[bold green]Done![/] Processed {count} items.")
\`\`\`

## Error Handling

\`\`\`python
@cli.command()
@click.argument("url")
def check(url: str):
    """Check if a URL is reachable."""
    import httpx

    try:
        with console.status(f"[bold blue]Checking {url}..."):
            response = httpx.get(url, timeout=10)
        if response.status_code == 200:
            console.print(f"[green]:white_check_mark: {url} is up ({response.status_code})")
        else:
            console.print(f"[yellow]:warning: {url} returned {response.status_code}")
    except httpx.RequestError as exc:
        console.print(f"[red]:x: Failed to reach {url}: {exc}")
        raise SystemExit(1)
\`\`\`

## Packaging

Add a \`pyproject.toml\` for distribution:

\`\`\`toml
[project.scripts]
mycli = "mycli.cli:cli"
\`\`\`

Now users install with \`pip install mycli\` and run \`mycli status\` from anywhere. The combination of Click's declarative command structure and Rich's visual output makes for CLI tools that developers actually enjoy using.
`,
  },
  {
    title: "Deploying to AWS Lambda with the Serverless Framework",
    slug: "aws-lambda-serverless-framework",
    excerpt: "A complete walkthrough of deploying Node.js functions to AWS Lambda using the Serverless Framework, including DynamoDB, API Gateway, and CI/CD.",
    tags: ["aws", "nodejs", "devops", "typescript"],
    publishedAt: new Date("2025-09-18"),
    content: `
The Serverless Framework remains one of the best ways to deploy Lambda functions. Here is a complete production setup from scratch.

## Project Structure

\`\`\`bash
my-api/
  functions/
    users/
      create.ts
      get.ts
      list.ts
  lib/
    dynamodb.ts
    response.ts
  serverless.yml
  package.json
  tsconfig.json
\`\`\`

## The serverless.yml

This is where infrastructure meets code:

\`\`\`yaml
service: my-api
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    USERS_TABLE: \${self:service}-users-\${sls:stage}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:Query
            - dynamodb:Scan
          Resource:
            - !GetAtt UsersTable.Arn

functions:
  createUser:
    handler: functions/users/create.handler
    events:
      - httpApi:
          path: /users
          method: post

  getUser:
    handler: functions/users/get.handler
    events:
      - httpApi:
          path: /users/{id}
          method: get

  listUsers:
    handler: functions/users/list.handler
    events:
      - httpApi:
          path: /users
          method: get

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: \${self:service}-users-\${sls:stage}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
\`\`\`

## Response Helper

Keep Lambda responses consistent:

\`\`\`typescript
export function success(body: Record<string, unknown>) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

export function error(statusCode: number, message: string) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ error: message }),
  };
}
\`\`\`

## Deploy and Test

\`\`\`bash
# Deploy to dev stage
npx serverless deploy --stage dev

# Test the endpoint
curl -X POST https://abc123.execute-api.us-east-1.amazonaws.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Check the logs
npx serverless logs -f createUser --stage dev --tail
\`\`\`

## CI/CD with GitHub Actions

\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx serverless deploy --stage prod
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
\`\`\`

The Serverless Framework handles the CloudFormation, packaging, and deployment orchestration. You focus on your business logic.
`,
  },
];
