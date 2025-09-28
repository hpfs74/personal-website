import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface PipelineStackProps extends cdk.StackProps {
	distribution: cloudfront.Distribution;
	siteBucket: s3.Bucket;
}

export class PipelineStack extends cdk.Stack {

	constructor(scope: Construct, id: string, props: PipelineStackProps) {
		super(scope, id, props);

		const {distribution, siteBucket} = props;

		// GitHub token secret - you need to manually set this in AWS Secrets Manager
		// with your actual GitHub personal access token
		const githubTokenSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GitHubToken', 'gh-token');


    // GitHub source credentials for CodeBuild
    new codebuild.GitHubSourceCredentials(this, 'GitHubSourceCredentials', {
      accessToken: githubTokenSecret.secretValue,
    });

    // CodeBuild project
    const codeBuildProject = new codebuild.Project(this, 'BuildProject', {
      source: codebuild.Source.gitHub({
        owner: 'hpfs74',
        repo: 'personal-website',
        webhook: true,
        webhookFilters: [
          codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main'),
        ],
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL,
        environmentVariables: {
          DISTRIBUTION_ID: {
            value: distribution.distributionId,
          },
        },
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
    });

    // Grant CodeBuild permissions to deploy to S3
    siteBucket.grantReadWrite(codeBuildProject);

    // Grant CodeBuild permissions to invalidate CloudFront
    codeBuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [distribution.distributionArn],
      }),
    );

    // Grant CodeBuild permissions for CDK deployment
    codeBuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'cloudformation:CreateStack',
          'cloudformation:UpdateStack',
          'cloudformation:DeleteStack',
          'cloudformation:DescribeStacks',
          'cloudformation:DescribeStackEvents',
          'cloudformation:DescribeStackResources',
          'cloudformation:GetTemplate',
          'cloudformation:ValidateTemplate',
          'cloudformation:CreateChangeSet',
          'cloudformation:DescribeChangeSet',
          'cloudformation:ExecuteChangeSet',
          'cloudformation:DeleteChangeSet',
          'cloudformation:ListChangeSets',
          'cloudformation:GetTemplateSummary',
        ],
        resources: ['*'],
      }),
    );

    // Grant CodeBuild permissions for SES, S3, Lambda, IAM, and Route53 operations
    codeBuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'ses:*',
          's3:CreateBucket',
          's3:DeleteBucket',
          's3:PutBucketPolicy',
          's3:PutBucketLifecycleConfiguration',
          's3:GetBucketLocation',
          'lambda:CreateFunction',
          'lambda:UpdateFunctionCode',
          'lambda:UpdateFunctionConfiguration',
          'lambda:DeleteFunction',
          'lambda:GetFunction',
          'lambda:AddPermission',
          'lambda:RemovePermission',
          'lambda:TagResource',
          'lambda:UntagResource',
          'iam:CreateRole',
          'iam:UpdateRole',
          'iam:DeleteRole',
          'iam:GetRole',
          'iam:PassRole',
          'iam:AttachRolePolicy',
          'iam:DetachRolePolicy',
          'iam:PutRolePolicy',
          'iam:DeleteRolePolicy',
          'iam:GetRolePolicy',
          'iam:TagRole',
          'iam:UntagRole',
          'route53:GetHostedZone',
          'route53:ListHostedZones',
          'route53:ChangeResourceRecordSets',
          'route53:GetChange',
          'route53:ListResourceRecordSets',
          'ssm:GetParameter',
          'ssm:GetParameters',
          'ssm:PutParameter',
          'ssm:DeleteParameter',
          'ssm:AddTagsToResource',
          'ssm:RemoveTagsFromResource',
        ],
        resources: ['*'],
      }),
    );

    // Grant CodeBuild permissions for CDK bootstrap operations
    codeBuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'sts:AssumeRole',
        ],
        resources: [
          `arn:aws:iam::${this.account}:role/cdk-*`,
        ],
      }),
    );

    // Create invalidation project for CloudFront cache invalidation
    const invalidationProject = new codebuild.Project(this, 'InvalidateProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              `aws cloudfront create-invalidation --distribution-id ${distribution.distributionId} --paths "/*"`,
            ],
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL,
      },
    });

    // Grant the invalidation project CloudFront permissions
    invalidationProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [distribution.distributionArn],
      }),
    );

    // CodePipeline
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'matteo-website-pipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: 'hpfs74',
              repo: 'personal-website',
              branch: 'main',
              oauthToken: cdk.SecretValue.secretsManager('gh-token'), // Store GitHub token in Secrets Manager
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CodeBuild',
              project: codeBuildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.S3DeployAction({
              actionName: 'S3Deploy',
              bucket: siteBucket,
              input: buildOutput,
              runOrder: 1,
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'InvalidateCache',
              project: invalidationProject,
              input: buildOutput,
              runOrder: 2,
            }),
          ],
        },
      ],
    });

	}
}