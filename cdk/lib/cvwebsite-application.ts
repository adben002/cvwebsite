import { Fn, RemovalPolicy, Stack, StackProps, Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StageProps } from 'aws-cdk-lib/core/lib/stage';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginAccessIdentity,
  PriceClass,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { PublicHostedZone, RecordSet, RecordTarget, RecordType } from 'aws-cdk-lib/aws-route53';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { CachedMethods } from 'aws-cdk-lib/aws-cloudfront/lib/distribution';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

const DOMAIN_NAME = 'adben002.com';

class CvWebsiteApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const publicHostedZone = new PublicHostedZone(this, 'Zone', {
      zoneName: DOMAIN_NAME,
    });

    new AwsCustomResource(this, 'UpdateNameServers', {
      onCreate: {
        service: 'Route53Domains',
        action: 'updateDomainNameservers',
        parameters: {
          DomainName: DOMAIN_NAME,
          Nameservers: [...Array(4).keys()].map((key) => ({
            Name: Fn.select(key, publicHostedZone.hostedZoneNameServers!),
          })),
        },
        region: 'us-east-1',
        physicalResourceId: PhysicalResourceId.of('Update domain name servers of domain'),
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

    const originAccessIdentity = new OriginAccessIdentity(this, 'OIA');
    websiteBucket.grantRead(originAccessIdentity);

    const cloudfrontDistribution = new Distribution(this, 'MyDistribution', {
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
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_100,
      certificate: new DnsValidatedCertificate(this, 'SiteCertificate', {
        domainName: DOMAIN_NAME,
        hostedZone: publicHostedZone,
        region: 'us-east-1',
      }),
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset(`${__dirname}/../../app/dist/app`)],
      destinationBucket: websiteBucket,
    });

    new RecordSet(this, 'RecordSet', {
      recordName: DOMAIN_NAME,
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution)),
      zone: publicHostedZone,
    });
  }
}

export default class CvWebsiteApplicationStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new CvWebsiteApplicationStack(this, 'CvWebsiteApplicationStack', props);
  }
}
