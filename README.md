# Patchly

> The code review bot that actually helps.

Reviews every PR in minutes. Flags the bugs, suggests the fix, and explains why — like a senior engineer on your team.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Runtime:** Node.js 18+

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with waitlist signup and interactive demo |
| `/try` | Paste a unified diff, get instant review comments |

## Deploy

Push to Vercel — zero config. The project uses the default Next.js build settings.

```bash
vercel --prod
```

## Status

**v0 skeleton.** Landing page ported from static HTML, `/try` page with pattern-based diff review, waitlist API proxied to the shared backend.
