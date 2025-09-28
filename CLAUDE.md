# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Matteo's personal CV website - a production-ready static site built with Astro.js, Tailwind CSS v4, and comprehensive AWS cloud infrastructure. The project follows modern development practices with TypeScript, comprehensive testing via Vitest, and automated CI/CD deployment.

## Key Development Commands

```bash
# Development
npm run dev                    # Start Astro dev server (localhost:4321)
npm run build                  # Production build to dist/
npm run preview                # Preview production build locally

# Testing (Vitest with comprehensive setup)
npm run test                   # Interactive test runner
npm run test:run               # Single test run (used in CI)
npm run test:coverage          # Generate coverage reports
npm run test:ui                # Launch Vitest UI
npm run test:watch             # Watch mode for development

# Infrastructure (from infrastructure/ directory)
cd infrastructure
npm run deploy                 # Deploy AWS infrastructure
npm run diff                   # Preview infrastructure changes
npm run synth                  # Generate CloudFormation templates
```

## Architecture Overview

### Frontend Architecture
- **Astro.js v5** with component islands architecture for optimal performance
- **Tailwind CSS v4** with Vite plugin integration (`@import "tailwindcss"` in global.css)
- **Component-based structure**: 8 main components (Header, Hero, About, Experience, Skills, Projects, Contact, Footer)
- **Content Collections**: Type-safe blog posts with Zod schema validation
- **Node.js 24**: Pinned across project (.nvmrc, package.json engines, buildspec.yml)

### Testing Strategy
- **Vitest v3** with happy-dom environment for lightweight DOM simulation
- **@testing-library/dom** for component testing utilities
- Global test setup in `src/test/setup.ts` that mocks Astro environment
- Tests co-located with source files using `.test.ts` suffix
- Comprehensive utility function testing (see `src/utils/formatters.test.ts` with 42 test cases)

### Infrastructure (AWS CDK)
Four-stack architecture in `infrastructure/`:
1. **CertificateStack** (us-east-1): SSL certificate management
2. **WebsiteStack** (eu-south-1): S3 + CloudFront + Route 53 hosting
3. **PipelineStack** (eu-south-1): CodePipeline + CodeBuild CI/CD
4. **EmailStack** (eu-south-1): SES email forwarding from hello@matteo.wtf to matteo.salvestrini@icloud.com

### CI/CD Pipeline
Automated deployment via `buildspec.yml`:
1. Install dependencies (`npm ci`)
2. Run tests (`npm run test:run`) - must pass
3. Generate coverage reports (`npm run test:coverage`)
4. Build application (`npm run build`)
5. Deploy to S3 + CloudFront invalidation

## Key Configuration Files

- `astro.config.mjs`: Astro + Tailwind v4 integration
- `vitest.config.ts`: Comprehensive test environment with global setup
- `tsconfig.json`: Strict TypeScript configuration extending Astro defaults
- `infrastructure/bin/infrastructure.ts`: CDK app with multi-stack deployment
- `src/content/config.ts`: Content collections schema with Zod validation

## Important Development Notes

### Tailwind CSS v4 Integration
- Uses new Tailwind v4 with `@tailwindcss/vite` plugin
- Import via single line in `src/styles/global.css`: `@import "tailwindcss"`
- No separate tailwind.config file needed with v4

### Content Management
- Blog posts in `src/content/blog/` with frontmatter validation
- Schema enforces: title, description, pubDate, updatedDate, heroImage, tags
- Automatic type generation for content collections

### Testing Environment
- Custom test setup mocks Astro's component environment
- Use `happy-dom` for fast DOM simulation
- Coverage reporting configured with v8 provider
- Multiple output formats supported (text, json, html)

### Infrastructure Deployment
- Multi-region setup: Certificate in us-east-1, hosting in eu-south-1
- Secure S3 hosting with Origin Access Control (private buckets)
- Custom domain: www.matteo.wtf with automatic DNS management
- Automated SSL certificate provisioning and renewal
- Email forwarding: SES receives emails at hello@matteo.wtf, Lambda forwards to matteo.salvestrini@icloud.com

### Email Infrastructure Details
- **S3 Bucket**: Temporary email storage with 7-day lifecycle policy
- **Lambda Function**: Node.js 20.x runtime for email processing and forwarding
- **SES Rules**: Receipt rule set with S3 and Lambda actions
- **MX Record**: Automatically created pointing to `inbound-smtp.eu-south-1.amazonaws.com`
- **Required Setup**: SES domain verification and email address verification for matteo.salvestrini@icloud.com

### Component Development
- Follow existing component patterns in `src/components/`
- Use TypeScript interfaces for props
- Leverage Astro's component islands for client-side interactivity when needed
- Maintain responsive design patterns with Tailwind utilities

### Performance Considerations
- Static site generation for optimal performance
- CloudFront CDN for global delivery
- Astro's partial hydration architecture
- Image optimization ready (add when needed)

## Common Development Workflows

### Adding New Blog Posts
1. Create markdown file in `src/content/blog/`
2. Include required frontmatter (title, description, pubDate, etc.)
3. Content automatically validated against Zod schema

### Infrastructure Changes
1. Modify CDK stacks in `infrastructure/lib/`
2. Test with `npm run diff` to preview changes
3. Deploy with `npm run deploy`
4. CI/CD pipeline automatically redeploys website

### Testing New Features
1. Write tests alongside implementation
2. Use `npm run test:watch` during development
3. Ensure `npm run test:run` passes before committing
4. Check coverage with `npm run test:coverage`

The project emphasizes type safety, comprehensive testing, and production-ready infrastructure with modern development practices.