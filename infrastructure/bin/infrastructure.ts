#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteStack } from '../lib/website-stack';
import { CertificateStack } from '../lib/certificate-stack';
import { FrontendPipelineStack } from '../lib/pipeline-stack';
import { InfrastructurePipelineStack } from '../lib/infrastructure-pipeline-stack';
import { EmailStack } from '../lib/email-stack';

const app = new cdk.App();


const certificateStack = new CertificateStack(app, 'CertificateStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },  
  domain: 'matteo.wtf',
  subdomain: 'www',
  crossRegionReferences: true,
});

const websiteStack = new WebsiteStack(app, 'PersonalWebsiteStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-south-1',
  },
  crossRegionReferences: true,

  domain: 'matteo.wtf',
  subdomain: 'www',
  certificate: certificateStack.certificate,
});

// Infrastructure pipeline - self-mutating for infrastructure changes
const infrastructurePipelineStack = new InfrastructurePipelineStack(app, 'InfrastructurePipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-south-1',
  },
});

// Frontend pipeline - for website code changes
const frontendPipelineStack = new FrontendPipelineStack(app, 'FrontendPipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-south-1',
  },
  crossRegionReferences: true,
  distribution: websiteStack.distribution,
  siteBucket: websiteStack.siteBucket,
});

// Email forwarding stack for hello@matteo.wtf
const emailStack = new EmailStack(app, 'EmailStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-south-1',
  },
  domain: 'matteo.wtf',
});

// Suppress unused variable warning - emailStack is used by CDK app
void emailStack;

websiteStack.addDependency(certificateStack);
frontendPipelineStack.addDependency(websiteStack);