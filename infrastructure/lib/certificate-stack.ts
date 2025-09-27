import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from 'aws-cdk-lib/aws-route53';

export interface CertificateStackProps extends cdk.StackProps {
  domain: string;
  subdomain?: string;
}

export class CertificateStack extends cdk.Stack {
  certificate: certificatemanager.ICertificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { domain, subdomain } = props;
    const domainName = subdomain ? `${subdomain}.${domain}` : domain;
    const siteDomain = subdomain ? domainName : `www.${domain}`;

		// Route 53 Hosted Zone (assumes it already exists)
		const zone = route53.HostedZone.fromLookup(this, 'Zone', {
			domainName: props.domain,
		});

    this.certificate = new certificatemanager.Certificate(
      this,
      "SiteCertificate",
      {
        domainName: siteDomain,
        validation: certificatemanager.CertificateValidation.fromDns(zone),
        subjectAlternativeNames: [`*.${props.domain}`],
      },
    );
  }
}
