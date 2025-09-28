#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteStack } from '../lib/website-stack';
import { CertificateStack } from '../lib/certificate-stack';
import { PipelineStack } from '../lib/pipeline-stack';
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

const websiteStack = new WebsiteStack(app, 'MatteoWebsiteStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-south-1',
  },
  crossRegionReferences: true,

  domain: 'matteo.wtf',
  subdomain: 'www',
  certificate: certificateStack.certificate,
});

const pipelineStack = new PipelineStack(app, 'PipelineStack', {
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
pipelineStack.addDependency(websiteStack);