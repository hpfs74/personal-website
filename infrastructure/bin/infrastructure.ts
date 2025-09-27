#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteStack } from '../lib/website-stack';
import { CertificateStack } from '../lib/certificate-stack';

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
  domain: 'matteo.wtf',
  subdomain: 'www',
  certificate: certificateStack.certificate,
  crossRegionReferences: true,
});
