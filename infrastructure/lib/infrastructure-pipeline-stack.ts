import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { WebsiteStack } from './website-stack';
import { CertificateStack } from './certificate-stack';
import { EmailStack } from './email-stack';

export class InfrastructurePipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Self-mutating pipeline using CDK Pipelines
    const pipeline = new CodePipeline(this, 'InfrastructurePipeline', {
      pipelineName: 'matteo-infrastructure-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('hpfs74/personal-website', 'main', {
          authentication: cdk.SecretValue.secretsManager('gh-token'),
          trigger: cdk.aws_codepipeline_actions.GitHubTrigger.WEBHOOK,
        }),
        primaryOutputDirectory: 'infrastructure/cdk.out',
        commands: [
          // Check if infrastructure files changed, exit early if not
          'CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "all")',
          'if [ "$CHANGED_FILES" != "all" ] && ! echo "$CHANGED_FILES" | grep -q "^infrastructure/"; then echo "No infrastructure changes detected, exiting" && exit 0; fi',
          'echo "Infrastructure changes detected, proceeding with deployment"',
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

class InfrastructureStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    // Certificate stack in us-east-1 for CloudFront
    const certificateStack = new CertificateStack(this, 'CertificateStack', {
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
      env: {
        account: this.account!,
        region: 'eu-south-1',
      },
      domain: 'matteo.wtf',
    });

    websiteStack.addDependency(certificateStack);
  }
}