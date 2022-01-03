#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import CvWebsiteStack from '../lib/cvwebsite-stack';

const app = new cdk.App();
new CvWebsiteStack(app, 'CvWebsiteDeployStack', {});
