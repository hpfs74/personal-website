import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { WebsiteStack } from './website-stack';
import { CertificateStack } from './certificate-stack';
import { EmailStack } from './email-stack';
import { FrontendPipelineStack } from './pipeline-stack';
import {
  CODESTAR_CONNECTION_ARN,
  GITHUB_BRANCH,
  GITHUB_REPO_ID,
} from './source-config';

export class InfrastructurePipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Self-mutating pipeline using CDK Pipelines
    const pipeline = new CodePipeline(this, 'InfrastructurePipeline', {
      pipelineName: 'matteo-infrastructure-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(GITHUB_REPO_ID, GITHUB_BRANCH, {
          connectionArn: CODESTAR_CONNECTION_ARN,
        }),
        primaryOutputDirectory: 'infrastructure/cdk.out',
        commands: [
          'cd infrastructure',
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
        env: {
          CDK_DEFAULT_ACCOUNT: this.account!,
          CDK_DEFAULT_REGION: this.region!,
        },
      }),
      selfMutation: true,
      crossAccountKeys: false,
    });

    // Create application stage for infrastructure stacks
    const infraStage = new InfrastructureStage(this, 'InfrastructureStage', {
      env: {
        account: this.account!,
        region: 'eu-south-1',
      },
    });

    pipeline.addStage(infraStage);
  }
}

/**
 * The stacks the infrastructure pipeline deploys.
 *
 * Each stack sets an explicit `stackName` matching the stack already deployed
 * by `bin/infrastructure.ts`, so the pipeline UPDATES the live stacks rather
 * than creating a second copy of each.
 *
 * Without these overrides, a `cdk.Stage` prefixes its stack names with the
 * stage id, producing `InfrastructureStage-EmailStack` etc. Those duplicates
 * cannot coexist with the originals: EmailStack hardcodes the bucket name
 * `matteo.wtf-email-forwarding` and the SES rule set name, and WebsiteStack
 * hardcodes the bucket `www.matteo.wtf` plus the Route 53 A record — all
 * globally unique. The duplicate EmailStack failed on exactly that collision
 * and sat in ROLLBACK_COMPLETE, permanently failing this stage.
 *
 * Keep these names in sync with `bin/infrastructure.ts`.
 */
class InfrastructureStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    // Certificate stack in us-east-1 for CloudFront
    const certificateStack = new CertificateStack(this, 'CertificateStack', {
      stackName: 'CertificateStack',
      env: {
        account: this.account!,
        region: 'us-east-1',
      },
      domain: 'matteo.wtf',
      subdomain: 'www',
      crossRegionReferences: true,
    });

    // Website stack in eu-south-1
    const websiteStack = new WebsiteStack(this, 'WebsiteStack', {
      stackName: 'PersonalWebsiteStack',
      env: {
        account: this.account!,
        region: 'eu-south-1',
      },
      crossRegionReferences: true,
      domain: 'matteo.wtf',
      subdomain: 'www',
      certificate: certificateStack.certificate,
    });

    // Email stack
    const emailStack = new EmailStack(this, 'EmailStack', {
      stackName: 'EmailStack',
      env: {
        account: this.account!,
        region: 'eu-south-1',
      },
      domain: 'matteo.wtf',
    });

    // The frontend pipeline must be part of this stage even though it is not
    // "infrastructure" in the narrow sense. It consumes websiteStack's
    // distribution and bucket, and that consumption is what makes CDK emit the
    // cross-stack Exports on PersonalWebsiteStack. A stage without it
    // synthesises a PersonalWebsiteStack template with no Outputs at all, so
    // deploying it tries to delete exports the real FrontendPipelineStack still
    // imports, and CloudFormation rejects the update:
    //   "Cannot delete export PersonalWebsiteStack:ExportsOutputRefSiteDistribution...
    //    as it is in use by FrontendPipelineStack"
    //
    // The rule: because the stage stacks adopt the live stack names, the stage
    // has to mirror the whole app. Anything added to bin/infrastructure.ts that
    // produces or consumes a cross-stack reference belongs here too.
    const frontendPipelineStack = new FrontendPipelineStack(this, 'FrontendPipelineStack', {
      stackName: 'FrontendPipelineStack',
      env: {
        account: this.account!,
        region: 'eu-south-1',
      },
      crossRegionReferences: true,
      distribution: websiteStack.distribution,
      siteBucket: websiteStack.siteBucket,
    });

    void emailStack;

    websiteStack.addDependency(certificateStack);
    frontendPipelineStack.addDependency(websiteStack);
  }
}