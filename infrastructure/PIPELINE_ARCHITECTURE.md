# Pipeline Architecture

This infrastructure implements a dual-pipeline architecture that separates frontend deployments from infrastructure changes.

## Pipeline Overview

### 1. Infrastructure Pipeline (Self-Mutating)
- **Stack**: `InfrastructurePipelineStack`
- **Purpose**: Manages infrastructure changes and updates itself
- **Trigger**: Changes to `infrastructure/` folder only
- **Type**: CDK Pipelines with self-mutation capability
- **Buildspec**: `infrastructure/buildspec-infrastructure.yml`

### 2. Frontend Pipeline
- **Stack**: `FrontendPipelineStack`
- **Purpose**: Builds and deploys website code
- **Trigger**: Changes to any files EXCEPT `infrastructure/` folder
- **Type**: Traditional CodePipeline
- **Buildspec**: `buildspec-frontend.yml`

## How It Works

### Infrastructure Changes
1. When you modify files in `infrastructure/`, only the Infrastructure Pipeline triggers
2. The pipeline uses CDK Pipelines construct for self-mutation
3. It automatically updates its own pipeline definition if needed
4. Then deploys the infrastructure stacks (Certificate, Website, Email)
5. The pipeline manages its own lifecycle - no manual intervention needed

### Frontend Changes
1. When you modify website code (outside `infrastructure/`), only the Frontend Pipeline triggers
2. Runs tests, builds the Astro application
3. Deploys to S3 and invalidates CloudFront cache
4. No infrastructure changes are attempted

## Deployment Commands

### Initial Setup (One-time)
```bash
cd infrastructure
npm ci
npm run bootstrap  # Deploys the infrastructure pipeline
```

### Manual Deployments (if needed)
```bash
# Deploy all stacks manually
npm run deploy:all

# Deploy only infrastructure pipeline
npm run deploy:infrastructure-pipeline

# Deploy only frontend pipeline
npm run deploy:frontend-pipeline
```

## Pipeline Features

### Self-Mutation
- Infrastructure pipeline automatically updates itself when its code changes
- No manual pipeline updates required
- Ensures pipeline definition stays in sync with code

### Path-Based Triggering
- Infrastructure pipeline: `infrastructure/**` path filter
- Frontend pipeline: `!(infrastructure/**)` path filter (negated)
- Prevents unnecessary pipeline executions

### Independent Operation
- Both pipelines can run simultaneously without conflicts
- Frontend deployments don't affect infrastructure
- Infrastructure changes don't trigger unnecessary frontend builds

## Monitoring

- **Infrastructure Pipeline**: `matteo-infrastructure-pipeline`
- **Frontend Pipeline**: `matteo-frontend-pipeline`

Both pipelines appear in AWS CodePipeline console and can be monitored independently.

## Security

- Both pipelines use the same GitHub token stored in AWS Secrets Manager (`gh-token`)
- Infrastructure pipeline has elevated permissions for CDK operations
- Frontend pipeline has minimal permissions (S3, CloudFront only)