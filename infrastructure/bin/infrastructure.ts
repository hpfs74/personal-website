#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MatteoWebsiteStack } from '../lib/matteo-website-stack';

const app = new cdk.App();

new MatteoWebsiteStack(app, 'MatteoWebsiteStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  domain: 'matteo.wtf',
  subdomain: 'www',
});