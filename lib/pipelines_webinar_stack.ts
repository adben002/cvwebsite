#!/usr/bin/env node
import { DnsValidatedCertificate } from "@aws-cdk/aws-certificatemanager";
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  SecurityPolicyProtocol,
  SSLMethod,
} from "@aws-cdk/aws-cloudfront";
import { ARecord, PublicHostedZone, RecordTarget } from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets/lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  RedirectProtocol,
} from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { Construct, Fn, Stack, StackProps } from "@aws-cdk/core";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "@aws-cdk/custom-resources";
import { join } from "path";

export interface CvSiteProps extends StackProps {
  domainName: string;
}

export class CvSite extends Stack {
  constructor(scope: Construct, id: string, props: CvSiteProps) {
    super(scope, id, props);

    const zone = new PublicHostedZone(this, "Zone", {
      zoneName: props.domainName,
    });

    new AwsCustomResource(this, "UpdateNameServers", {
      onCreate: {
        service: "Route53Domains",
        action: "updateDomainNameservers",
        parameters: {
          DomainName: props.domainName,
          Nameservers: [...Array(3).keys()].map((key) => ({
            Name: Fn.select(key, zone.hostedZoneNameServers!!),
          })),
        },
        region: "us-east-1",
        physicalResourceId: PhysicalResourceId.of(
          "Update domain name servers of domain"
        ),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    /*
     * Buckets.
     */
    const siteBucket = new Bucket(this, "SiteBucket", {
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    const redirectBucket = new Bucket(this, "WwwSiteBucket", {
      websiteRedirect: {
        hostName: props.domainName,
        protocol: RedirectProtocol.HTTPS,
      },
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const certificateArn = new DnsValidatedCertificate(
      this,
      "SiteCertificate",
      {
        domainName: props.domainName,
        subjectAlternativeNames: ["www." + props.domainName],
        hostedZone: zone,
        region: "us-east-1",
      }
    ).certificateArn;

    /*
     * Cloud Front.
     */
    const oai = new OriginAccessIdentity(this, "OIA");
    siteBucket.grantRead(oai);

    const wwwOai = new OriginAccessIdentity(this, "WwwOIA");
    redirectBucket.grantRead(wwwOai);

    const distribution = new CloudFrontWebDistribution(
      this,
      "SiteDistribution",
      {
        aliasConfiguration: {
          acmCertRef: certificateArn,
          names: [props.domainName],
          sslMethod: SSLMethod.SNI,
          securityPolicy: SecurityPolicyProtocol.TLS_V1_1_2016,
        },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: siteBucket,
              originAccessIdentity: oai,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );
    const wwwDistribution = new CloudFrontWebDistribution(
      this,
      "WwwSiteDistribution",
      {
        aliasConfiguration: {
          acmCertRef: certificateArn,
          names: ["www." + props.domainName],
          sslMethod: SSLMethod.SNI,
          securityPolicy: SecurityPolicyProtocol.TLS_V1_1_2016,
        },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: redirectBucket,
              originAccessIdentity: wwwOai,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        defaultRootObject: "",
      }
    );

    /*
     * Route53 Records.
     */
    new ARecord(this, "SiteAliasRecord", {
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone,
    });
    new ARecord(this, "SiteAliasWwwRecord", {
      recordName: "www." + props.domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(wwwDistribution)),
      zone,
    });

    /*
     * Deploy to the bucket.
     */
    new BucketDeployment(this, "DeployWithInvalidation", {
      sources: [
        Source.asset(
          join(__dirname, "..", "site-contents", "dist", "site-contents")
        ),
      ],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
