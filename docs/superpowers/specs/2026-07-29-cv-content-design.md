# CV content rewrite — design

**Date:** 2026-07-29
**Scope:** Replace the placeholder content in `src/components/` with Matteo Salvestrini's real history.

## Problem

Every section of the site ships with template boilerplate: "Tech Company", "StartupXYZ",
"Digital Agency", an e-commerce/task-manager/weather-dashboard project set linking to
repositories that do not exist, and a skills list naming Kubernetes, Terraform, MongoDB and
GraphQL while omitting C# and .NET entirely. Only `Contact.astro` holds real data.

## Positioning

**Founder-turned-architect.** Lead with the arc: 22 years founding and running an ISP, then
cloud architecture and fintech engineering. This is the rare credential — six years of FIX
work is not.

Sources: LinkedIn (`linkedin.com/in/salve`) for history and dates; GitHub commit history
(Jul 2025 – Jul 2026, ~900 commits) for current technical substance.

**Discretion rule:** MillTech repositories are private. Describe work by capability and
domain. No internal service names, repository names, or ticket identifiers.

## Content

### Hero

- Eyebrow: `Cloud Architect & Software Engineer`
- Heading: `Hi, I'm Matteo.`
- Tagline: *Three decades of building systems — from founding an ISP in Tuscany to FX trading
  infrastructure in London.*
- Buttons unchanged.

### 01 / About

Intro:

> I started building infrastructure before the cloud existed. In 1995 I founded an ISP in
> Prato and ran it for 22 years — network architecture, mail systems, virtualization,
> security, and the business around them.
>
> Today I'm a Senior Software Engineer at MillTech in London, working on the trading
> infrastructure behind an FX platform: FIX connectivity, pricing, market data, and the
> event-driven AWS services that tie them together.

Three cards (replacing Full-Stack Development / Problem Solving / Team Collaboration):

| Card | Body |
|---|---|
| Founder's Perspective | Twenty-two years running an ISP: network architecture, mail infrastructure, virtualization and security — alongside clients, payroll and P&L. I build software like someone who has had to keep it running. |
| Cloud Architecture | Serverless and event-driven systems on AWS, from CDK-defined infrastructure to Lambda, EventBridge and DynamoDB. Spoke at Aegon's AGT conference on serverless computing. |
| Trading Systems | FIX connectivity, pricing and market data for an FX platform in C# and .NET, with the security and reliability work regulated finance demands. |

### 02 / Experience

Seven entries, reverse-chronological. Aegon and Knab stay as their own entries rather than
nested under HCL — Knab starts before HCL, so nesting would misstate the dates.

1. **Senior Software Engineer — MillTech** · Sep 2020 – Present · London (Remote)
   Engineering across the trading infrastructure of an FX and cash-management platform. Built
   S3-backed archival for FIX message storage with a staged three-state rollout, and
   event-driven publishing of trade-lifecycle events with at-most-once delivery. Hardened
   access control and tenant isolation across client-facing applications, and migrated a
   legacy .NET Framework/WCF service onto .NET 10 with CoreWCF.
   *C#, .NET, TypeScript, AWS, FIX, Docker*

2. **Full Stack Engineer — Aegon** · Oct 2018 – Aug 2020 · The Hague, Netherlands
   Developer on Aegon's mortgage team, building web applications on AWS behind an Apigee
   proxy with AppDynamics monitoring. SCRUM within a SAFe framework.
   *AWS, Apigee, AppDynamics, JavaScript, SAFe*

3. **Technical Manager — HCL Technologies** · Nov 2017 – Aug 2020 · The Hague, Netherlands
   Partnered with sales teams to design custom AWS applications, starting from the customer's
   business problem and working backwards to the solution. Spoke at the Aegon AGT conference
   on serverless computing, and worked with HR to recruit local developers with strong DevOps
   experience.
   *AWS, Serverless, Pre-sales, Hiring*

4. **Full Stack Engineer — Knab** · Jan 2017 – Sep 2018 · Randstad, Netherlands
   Developer on Knab's insurance application, hosted on AWS.
   *AWS, JavaScript, Insurance*

5. **CEO & Founder — Connessioni Metropolitane Srl** · Feb 1995 – Jan 2017 · Prato, Italy
   Founded and ran an internet service provider for 22 years. Led software development, cyber
   security, virtualization, mail system infrastructure and network architecture — alongside
   running the business itself.
   *Network Architecture, Cyber Security, Virtualization, Linux*

6. **Founder & Director — Ingenio Software Srl** · Apr 2004 – Jun 2014 · Italy
   Built an ecommerce and collaboration platform on the Microsoft .NET stack, extended with
   IoT devices pushing employee check-in/check-out notifications, with the collected data
   exposed through an API.
   *.NET, IoT, Ecommerce, APIs*

7. **Earlier Roles — Orangelink · Absolute · Reckon Digital · Abaco** · 1990 – 2016 · Italy & UK
   Software architecture at Orangelink (MEAN-stack document database secured for banking and
   telco users) and Absolute (Azure ecommerce platform for a tour operator); JavaScript
   development for FAO.org at Reckon Digital; TIFF imaging libraries at Abaco.
   *MEAN Stack, Azure, JavaScript, Software Architecture*

   Note: this entry uses the same `{title, company, period, description, technologies}` shape
   as the others so `Experience.astro` needs no structural change — the companies are folded
   into the `company` field.

### 03 / Skills

| Category | Entries |
|---|---|
| Cloud & Infrastructure | AWS, AWS CDK, Lambda, S3, DynamoDB, EventBridge, SQS, Cognito, CloudFront, Docker |
| Programming Languages | C#, TypeScript, JavaScript, PowerShell, SQL |
| Backend | .NET, ASP.NET Core, FIX Protocol, CoreWCF, REST APIs, Event-Driven Architecture |
| Frontend | React, Astro, Tailwind CSS, Nx |
| Practice & Quality | Agile, SCRUM, SAFe, GitHub Actions, TeamCity, NUnit, Playwright, Mentoring |
| Spoken Languages | Italian (native), English (professional), Spanish, Portuguese, Dutch |

The two language categories are named "Programming Languages" and "Spoken Languages" so the
rendered category headings don't collide.

Removed: Kubernetes, Terraform, MongoDB, GraphQL, Vue.js, Python, Express.js, Redis — no
evidence in 31 years of history or 900 recent commits.

### 04 / Projects

Existing accent colours retained (`#4f7fe8`, `#34c97e`, `#d4a843`). All links resolve; the
fabricated `demo` URLs are removed.

1. **Family Budget** — Serverless budgeting application on AWS: Cognito authentication,
   CDK-defined infrastructure, and an analytics view aggregating spend by category and
   subject over configurable ranges. End-to-end tested with Playwright.
   *TypeScript, AWS CDK, Cognito, Playwright* — `github.com/hpfs74/family-budget`

2. **Copy Text From Video** — Chrome extension for selecting and copying text out of video
   frames, released through a pipeline that publishes to the Chrome Web Store on every tagged
   release.
   *JavaScript, Chrome Extension, GitHub Actions* — `github.com/hpfs74/copy-text-video`

3. **matteo.wtf** — This site. Static Astro build behind CloudFront, with two CodePipelines —
   one for the site, one self-mutating for the infrastructure — and SES email forwarding, all
   defined in CDK.
   *Astro, AWS CDK, CodePipeline, SES* — `github.com/hpfs74/personal-website`

### 05 / Contact

Unchanged, plus a LinkedIn link (`linkedin.com/in/salve`) beside the existing GitHub link.

## Out of scope

- Certifications section (2005–2015 entries read as dated).
- Any layout, styling or component-structure change. Content literals and inline prose only.
- The blog, which keeps its unmigrated light palette.

## Verification

- `npm run build` succeeds.
- `npm run test:run` — 48 existing tests still pass (they cover `src/utils/`, untouched here).
- No remaining occurrences of `Tech Company`, `StartupXYZ`, `Digital Agency`,
  `ecommerce-platform`, `task-manager`, `weather-dashboard`.
