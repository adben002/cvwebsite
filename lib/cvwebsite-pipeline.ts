import { Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import { CfnConnection } from "aws-cdk-lib/aws-codestarconnections";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

import CvwebsiteStack from "./cvwebsite-stack";

const repoOwner = "adben002";
const repoName = "cvwebsite";

export class CvwebsitePipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        // Use a connection created using the AWS console to authenticate to GitHub
        // Other sources are available.
        input: CodePipelineSource.connection(
          `${repoOwner}/${repoName}`,
          "main",
          {
            connectionArn: new CfnConnection(this, "CfnConnection", {
              providerType: "GitHub",
              connectionName: `${repoName}-github-connection`,
            }).attrConnectionArn,
          }
        ),
        commands: [
          "npm ci -q",
          "(cd client && npm ci -q && npm run build)",
          "npx cdk synth -q",
        ],
      }),
    });

    if (process.env.CODEBUILD_BUILD_ID) {
      pipeline.addStage(
        new CvwebsiteApplicationStage(this, "CvwebsiteApplicationStage")
      );
    }
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
