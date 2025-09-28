import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface WebsiteStackProps extends cdk.StackProps {
  domain: string;
  subdomain?: string;
  certificate: certificatemanager.ICertificate;
}

export class WebsiteStack extends cdk.Stack {
  distribution: cloudfront.Distribution;
  siteBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);
    const { certificate } = props;

    const domainName = props.subdomain
      ? `${props.subdomain}.${props.domain}`
      : props.domain;
    const siteDomain = props.subdomain ? domainName : `www.${props.domain}`;

    // S3 bucket for website hosting
    this.siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: siteDomain,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
    });

    // Route 53 Hosted Zone (assumes it already exists)
    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domain,
    });

    // CloudFront Origin Access Control
    const originAccessControl = new cloudfront.S3OriginAccessControl(
      this,
      "OriginAccessControl",
      {
        originAccessControlName: `${siteDomain}-oac`,
        signing: cloudfront.Signing.SIGV4_ALWAYS,
      },
    );

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: [siteDomain],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: "/404.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
      ],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(
          this.siteBucket,
          {
            originAccessControlId: originAccessControl.originAccessControlId,
          },
        ),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // S3 bucket policy for CloudFront OAC
    this.siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [this.siteBucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
          },
        },
      }),
    );

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, "SiteAliasRecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(this.distribution),
      ),
      zone,
    });
  }
}
