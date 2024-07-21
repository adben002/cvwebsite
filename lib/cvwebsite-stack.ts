import { Fn, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  Distribution,
  HttpVersion,
  OriginAccessIdentity,
  PriceClass,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  PublicHostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

const DOMAIN_NAME = "adben002.com";

export default class CvwebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const publicHostedZone = new PublicHostedZone(this, "Zone", {
      zoneName: DOMAIN_NAME,
    });

    new AwsCustomResource(this, "UpdateNameServers", {
      onCreate: {
        service: "Route53Domains",
        action: "updateDomainNameservers",
        parameters: {
          DomainName: DOMAIN_NAME,
          Nameservers: [...Array(4).keys()].map((key) => ({
            Name: Fn.select(key, publicHostedZone.hostedZoneNameServers ?? []),
          })),
        },
        region: "us-east-1",
        physicalResourceId: PhysicalResourceId.of(
          "Update domain name servers of domain",
        ),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    const websiteBucket = new Bucket(this, "Bucket", {
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const originAccessIdentity = new OriginAccessIdentity(this, "OIA");
    websiteBucket.grantRead(originAccessIdentity);

    const cloudfrontDistribution = new Distribution(this, "MyDistribution", {
      domainNames: [DOMAIN_NAME],
      defaultBehavior: {
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: CachedMethods.CACHE_GET_HEAD,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        origin: new S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
      },
      defaultRootObject: "index.html",
      priceClass: PriceClass.PRICE_CLASS_100,
      httpVersion: HttpVersion.HTTP2_AND_3,
      webAclId: new CfnWebACL(this, "WebACL", {
        scope: "CLOUDFRONT",
        defaultAction: {
          allow: {},
        },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "WebACL",
          sampledRequestsEnabled: true,
        },
        rules: [
          {
            name: "AWS-AWSManagedRulesAmazonIpReputationList",
            priority: 0,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesAmazonIpReputationList",
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesAmazonIpReputationList",
            },
          },
          {
            name: "AWS-AWSManagedRulesCommonRuleSet",
            priority: 1,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesCommonRuleSet",
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesCommonRuleSet",
            },
          },
          {
            name: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
            priority: 2,
            statement: {
              managedRuleGroupStatement: {
                vendorName: "AWS",
                name: "AWSManagedRulesKnownBadInputsRuleSet",
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
            },
          },
        ],
      }).attrArn,
      certificate: new Certificate(this, "SiteCertificate", {
        domainName: DOMAIN_NAME,
        validation: CertificateValidation.fromDns(publicHostedZone),
      }),
    });

    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset(`${__dirname}/../client/dist`)],
      destinationBucket: websiteBucket,
    });

    new RecordSet(this, "RecordSet", {
      recordName: DOMAIN_NAME,
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(cloudfrontDistribution),
      ),
      zone: publicHostedZone,
    });
  }
}
