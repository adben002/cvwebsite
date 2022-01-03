import { Fn, RemovalPolicy, Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StageProps } from 'aws-cdk-lib/core/lib/stage';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3';
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerCertificate,
} from 'aws-cdk-lib/aws-cloudfront';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

const DOMAIN_NAME = 'adben002.com';

export default class CvWebsiteApplication extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new AwsCustomResource(this, 'UpdateNameServers', {
      onCreate: {
        service: 'Route53Domains',
        action: 'updateDomainNameservers',
        parameters: {
          DomainName: DOMAIN_NAME,
          Nameservers: [...Array(4).keys()].map((key) => ({
            Name: Fn.select(
              key,
              new PublicHostedZone(this, 'Zone', {
                zoneName: DOMAIN_NAME,
              }).hostedZoneNameServers!
            ),
          })),
        },
        region: 'us-east-1',
        physicalResourceId: PhysicalResourceId.of(
          'Update domain name servers of domain'
        ),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    const websiteBucket = new Bucket(this, 'Bucket', {
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const oai = new OriginAccessIdentity(this, 'OIA');
    websiteBucket.grantRead(oai);

    new CloudFrontWebDistribution(this, 'MyDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(
        new DnsValidatedCertificate(this, 'SiteCertificate', {
          domainName: DOMAIN_NAME,
          hostedZone: new PublicHostedZone(this, 'Zone', {
            zoneName: DOMAIN_NAME,
          }),
          region: 'us-east-1',
        })
      ),
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset(`${__dirname}/../app/dist/app`)],
      destinationBucket: websiteBucket,
    });
  }
}
