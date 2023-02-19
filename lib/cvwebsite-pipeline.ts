import { SecretValue, Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

import CvwebsiteStack from "./cvwebsite-stack";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CvwebsitePipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        // Use a connection created using the AWS console to authenticate to GitHub
        // Other sources are available.
        input: CodePipelineSource.gitHub("adben002/cvwebsite", "main", {
          authentication: SecretValue.secretsManager("github-token", {
            jsonField: "cvwebsite",
          }),
        }),
        commands: [
          "npm ci -q",
          "cd client && npm run build",
          "npx cdk synth -q",
        ],
      }),
    });

    pipeline.addStage(
      new CvwebsiteApplicationStage(this, "CvwebsiteApplicationStage")
    );
  }
}

class CvwebsiteApplicationStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new CvwebsiteStack(this, "CvwebsiteStack", {
      stackName: "CvwebsiteStack",
    });
  }
}
