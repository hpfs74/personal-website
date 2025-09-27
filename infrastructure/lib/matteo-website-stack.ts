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

export interface MatteoWebsiteStackProps extends cdk.StackProps {
  domain: string;
  subdomain?: string;
  certificate: certificatemanager.ICertificate;
}

export class MatteoWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MatteoWebsiteStackProps) {
    super(scope, id, props);
    const { certificate } = props;

    const domainName = props.subdomain ? `${props.subdomain}.${props.domain}` : props.domain;
    const siteDomain = props.subdomain ? domainName : `www.${props.domain}`;

    console.log(`Setting up website for domain: ${siteDomain}`);

    // GitHub token secret - you need to manually set this in AWS Secrets Manager
    // with your actual GitHub personal access token
    const githubTokenSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GitHubToken', 'gh-token');

    // S3 bucket for website hosting
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: siteDomain,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
    });

    // Route 53 Hosted Zone (assumes it already exists)
    const zone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: props.domain,
    });

    // CloudFront Origin Access Control
    const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'OriginAccessControl', {
      originAccessControlName: `${siteDomain}-oac`,
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate: certificate,
      defaultRootObject: 'index.html',
      domainNames: [siteDomain],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: '/404.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
        },
      ],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket, {
          originAccessControlId: originAccessControl.originAccessControlId,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // S3 bucket policy for CloudFront OAC
    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [siteBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      }),
    );

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone,
    });

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
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '18',
            },
          },
          pre_build: {
            commands: [
              'echo Install dependencies...',
              'npm ci',
            ],
          },
          build: {
            commands: [
              'echo Build started on `date`',
              'npm run build',
            ],
          },
          post_build: {
            commands: [
              'echo Build completed on `date`',
            ],
          },
        },
        artifacts: {
          files: [
            '**/*',
          ],
          'base-directory': 'dist',
        },
      }),
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


    // Outputs
    new cdk.CfnOutput(this, 'Site', {
      value: `https://${siteDomain}`,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: siteBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: certificate.certificateArn,
    });
  }
}