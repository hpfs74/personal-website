import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ses from "aws-cdk-lib/aws-ses";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as sesActions from "aws-cdk-lib/aws-ses-actions";

export interface EmailStackProps extends cdk.StackProps {
  domain: string;
}

export class EmailStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EmailStackProps) {
    super(scope, id, props);

    const { domain } = props;

    // S3 bucket for storing emails temporarily
    const emailBucket = new s3.Bucket(this, "EmailBucket", {
      bucketName: `${domain}-email-forwarding`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          id: "DeleteEmailsAfter7Days",
          enabled: true,
          expiration: cdk.Duration.days(7),
        },
      ],
    });

    // Lambda function for email forwarding
    const emailForwarder = new lambda.NodejsFunction(this, "EmailForwarder", {
      handler: `handler`,
      entry: `assets/lambdas/email-forwarder.js`,
      bundling: {
        minify: true,
        loader: { ".node": "file" },
        sourceMap: true,
      },
      environment: {
        EMAIL_BUCKET: emailBucket.bucketName,
        FROM_EMAIL: `hello@${domain}`,
        TO_EMAIL: "matteo.salvestrini+cvwebsite@icloud.com",
      },
      timeout: cdk.Duration.minutes(1),
    });

    // Grant permissions to Lambda
    emailBucket.grantRead(emailForwarder);

    emailForwarder.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      }),
    );

    // SES receipt rule set
    const ruleSet = new ses.ReceiptRuleSet(this, "EmailRuleSet", {
      receiptRuleSetName: `${domain}-receive-email-rules`,
    });

    // SES receipt rule for email forwarding
    const rule = new ses.ReceiptRule(this, "EmailForwardingRule", {
      ruleSet: ruleSet,
      recipients: [`hello@${domain}`],
      actions: [

        new sesActions.S3({
          bucket: emailBucket,
          objectKeyPrefix: "",
        }),
        new sesActions.Lambda({
          function: emailForwarder,
        }),
      ],
      enabled: true,
      scanEnabled: true,
      tlsPolicy: ses.TlsPolicy.REQUIRE,
    });

    // Create MX record for the domain
    // Note: This assumes the hosted zone already exists
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: domain,
    });

    new route53.MxRecord(this, "MxRecord", {
      zone: hostedZone,
      recordName: domain,
      values: [
        {
          hostName: `inbound-smtp.${this.region}.amazonaws.com`,
          priority: 10,
        },
      ],
      ttl: cdk.Duration.minutes(5),
    });
  }
}
