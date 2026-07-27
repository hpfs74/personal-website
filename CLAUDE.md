# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal CV + blog site for matteo.wtf. Static Astro 5 site (`src/`, root `package.json`) plus a separate AWS CDK app (`infrastructure/`, its own `package.json` and `node_modules`). The two halves have independent dependency trees and independent deployment pipelines — always `cd infrastructure` before running CDK commands.

## Commands

```bash
# Website (repo root)
npm run dev                # Astro dev server on localhost:4321
npm run build              # Static build to dist/
npm run preview            # Serve the built dist/

npm run test               # Vitest watch mode
npm run test:run           # Single run (what CI runs)
npm run test:coverage      # v8 coverage → text/json/html
npm run test:ui            # Vitest UI

# Single test file / single test
npx vitest run src/utils/formatters.test.ts
npx vitest run -t "formatDate"

# Infrastructure (cd infrastructure first)
npm run build              # tsc — CDK code is compiled TS
npm run diff               # Preview CloudFormation changes
npm run synth              # Synthesize templates
npm run deploy:all         # cdk deploy --all --require-approval never
npm run bootstrap          # One-time: node bootstrap-infrastructure.js
```

Node 24 is pinned in `.nvmrc`, `package.json` engines, and every buildspec.

There is no linter or formatter configured (no ESLint/Prettier/Biome) — don't look for one. Type checking comes from `astro check` / editor via `tsconfig.json` (extends `astro/tsconfigs/strict`).

## Architecture

### Site structure

- `src/pages/index.astro` composes the one-page CV from eight section components in `src/components/`. Components are self-contained: each holds its own content as a plain array/object literal in the frontmatter (see `Experience.astro`, `Skills.astro`, `Projects.astro`) — there is no CMS or shared data module. Editing CV content means editing those literals.
- `src/pages/blog/index.astro` + `src/pages/blog/[...slug].astro` render the `blog` content collection (`src/content/config.ts`, Zod schema: title, description, pubDate required; updatedDate, heroImage, tags optional). Markdown lives in `src/content/blog/`.
- `src/layouts/Layout.astro` is the only layout — sets `<head>`, loads Google Fonts (Syne + DM Sans) and `global.css`. It takes a single `title` prop.
- `src/utils/` holds the only unit-tested code (`formatters.ts`, `validation.ts`). Tests are co-located `.test.ts` files; 48 tests currently pass.

### Styling — Tailwind v4 with a custom theme

`src/styles/global.css` is the design system. It declares an `@theme` block with semantic tokens rather than using Tailwind's default palette:

`--color-bg` (#060c18 dark navy), `--color-surface`, `--color-border`, `--color-text`, `--color-muted`, `--color-accent` (#d4a843 gold), `--color-accent-dim`, plus `--font-display` (Syne) and `--font-body` (DM Sans).

These generate utilities like `bg-bg`, `text-muted`, `border-border`, `text-accent`, `font-display`. **Use these tokens for new UI, not raw Tailwind colors.** Tailwind v4 has no config file; the `@tailwindcss/vite` plugin is wired in `astro.config.mjs` and `@import "tailwindcss"` sits at the top of `global.css`.

Known inconsistency: the homepage components use the dark token theme, but `src/pages/blog/index.astro` and `[...slug].astro` still use the old light palette (`bg-white`, `text-gray-900`, `bg-blue-100`) and a large inline `<style>` block for prose/prism styling. The blog has not been migrated to the theme yet.

Markdown code highlighting is Prism (`astro.config.mjs` → `markdown.syntaxHighlight: 'prism'`). `remark-toc` and `rehype-accessible-emojis` are installed but currently commented out / unused.

### Testing

Vitest 3 with `happy-dom` and `globals: true`. `src/test/setup.ts` stubs a global `Astro` object (props/slots/params/url) so utility code that touches it doesn't blow up — `.astro` components themselves are not rendered in tests. Only `src/**/*.{test,spec}.*` is collected.

### AWS infrastructure — five stacks, two pipelines

`infrastructure/bin/infrastructure.ts` instantiates:

| Stack | Region | Purpose |
|---|---|---|
| `CertificateStack` | us-east-1 | ACM cert for www.matteo.wtf (must be us-east-1 for CloudFront) |
| `PersonalWebsiteStack` (`WebsiteStack`) | eu-south-1 | Private S3 bucket + CloudFront with Origin Access Control + Route 53 A record |
| `FrontendPipelineStack` | eu-south-1 | CodePipeline `matteo-frontend-pipeline` for website code |
| `InfrastructurePipelineStack` | eu-south-1 | Self-mutating CDK Pipeline `matteo-infrastructure-pipeline` |
| `EmailStack` | eu-south-1 | SES receipt rules → S3 → Lambda forwarder for hello@matteo.wtf |

Cross-region references between CertificateStack and WebsiteStack require `crossRegionReferences: true` on both.

**Important duplication:** `InfrastructurePipelineStack` defines an internal `InfrastructureStage` that re-instantiates `CertificateStack`, `WebsiteStack`, and `EmailStack` under stage-scoped names. So those three stacks exist twice in the CDK app — once top-level (deployed by `cdk deploy`) and once inside the pipeline stage (deployed by the pipeline). Changing a stack's props means changing them in **both** `bin/infrastructure.ts` and `lib/infrastructure-pipeline-stack.ts`, or the two deployment paths drift.

Both pipelines source from GitHub `hpfs74/personal-website` `main`, authenticating with a Secrets Manager secret named `gh-token`.

- Frontend pipeline builds with `buildspec-frontend.yml`: `npm ci` → `npm run test:run` → `npm run build` → deploy `dist/` to S3 → CloudFront invalidation. **Tests gate deploys.**
- Infrastructure pipeline synthesizes inline via a `ShellStep` (`cd infrastructure && npm ci && npm run build && npx cdk synth`), self-mutates, then deploys the stage.

Stale files to be aware of: root `buildspec.yml` and `infrastructure/buildspec-infrastructure.yml` are not referenced by any stack (the infra pipeline uses the inline ShellStep instead). `infrastructure/PIPELINE_ARCHITECTURE.md` and `README.md` still describe the older single-pipeline setup — the CDK code is the source of truth.

### Email forwarding

SES receipt rule set `matteo.wtf-receive-email-rules` writes inbound mail to the `matteo.wtf-email-forwarding` bucket (7-day lifecycle) and invokes a `NodejsFunction` bundled from `infrastructure/assets/lambdas/email-forwarder.js`, which re-sends via SES. Destination is set by the `TO_EMAIL` env var in `email-stack.ts` (currently `matteo.salvestrini+cvwebsite@icloud.com`). The MX record is created by the stack; SES domain verification and verification of the destination address are manual prerequisites.

## Conventions

- New blog post: drop a markdown file in `src/content/blog/` with valid frontmatter — routing and types are automatic.
- New CV section: create a component in `src/components/` following the existing pattern (data literal in frontmatter, `<section id="...">` with the numbered `NN / Label` accent eyebrow), then add it to `src/pages/index.astro`.
- Infrastructure change: `npm run diff` before `npm run deploy:all`, and remember the stage duplication noted above.
