#!/usr/bin/env node
import { Artifact } from "@aws-cdk/aws-codepipeline";
import { BitBucketSourceAction } from "@aws-cdk/aws-codepipeline-actions";
import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { WebServiceStage } from "./webservice_stage";
import { CfnConnection } from "@aws-cdk/aws-codestarconnections";

export enum EnvVars {
  RepoOwner = "REPO_OWNER",
  RepoName = "REPO_NAME",
  Branch = "BRANCH",
  DomainName = "DOMAIN_NAME",
  CdkDefaultAccount = "CDK_DEFAULT_ACCOUNT",
  CdkDefaultRegion = "CDK_DEFAULT_REGION",
}

export interface CdkStackProps extends StackProps {
  readonly repoOwner: string;
  readonly repoName: string;
  readonly branch?: string;
  readonly domainName: string;
}

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const sourceArtifact = new Artifact();
    const cloudAssemblyArtifact = new Artifact();

    new CdkPipeline(this, "Pipeline", {
      crossAccountKeys: false,
      pipelineName: "CvWebsitePipeline",
      cloudAssemblyArtifact,
      sourceAction: new BitBucketSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        codeBuildCloneOutput: true,
        owner: props.repoOwner,
        repo: props.repoName,
        branch: props.branch,
        connectionArn: new CfnConnection(this, "CodeStarConnection", {
          connectionName: props.domainName + "-cv-connection",
          providerType: "GitHub",
        }).attrConnectionArn,
      }),
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,

        installCommand: "npm ci && cd site-contents && npm ci && cd ..",
        // Use this if you need a build step (if you're not using ts-node
        // or if you have TypeScript Lambdas that need to be compiled).
        buildCommand:
          "npm run build && cd site-contents && npm run build && cd ..",
        environment: { privileged: true },
        environmentVariables: {
          [EnvVars.RepoOwner]: { value: props.repoOwner },
          [EnvVars.RepoName]: { value: props.repoName },
          [EnvVars.Branch]: { value: props.branch },
          [EnvVars.DomainName]: { value: props.domainName },
          [EnvVars.CdkDefaultAccount]: { value: props.env?.account },
          [EnvVars.CdkDefaultRegion]: { value: props.env?.region },
        },
      }),
    }).addApplicationStage(
      new WebServiceStage(this, "Prod", {
        domainName: props.domainName,
      })
    );
  }
}
