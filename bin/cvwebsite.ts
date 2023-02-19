#!/usr/bin/env node
import "source-map-support/register";

import { App } from "aws-cdk-lib";

import { CvwebsitePipeline } from "../lib/cvwebsite-pipeline";

new CvwebsitePipeline(new App(), "CvwebsitePipeline");
