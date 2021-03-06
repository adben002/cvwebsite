#!/usr/bin/env node
import { Artifact } from "@aws-cdk/aws-codepipeline";
import { GitHubSourceAction } from "@aws-cdk/aws-codepipeline-actions";
import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { WebServiceStage } from "./webservice_stage";

export enum EnvVars {
  RepoOwner = "REPO_OWNER",
  RepoName = "REPO_NAME",
  Branch = "BRANCH",
  DomainName = "DOMAIN_NAME",
  GithubToken = "GITHUB_TOKEN",
  CdkDefaultAccount = "CDK_DEFAULT_ACCOUNT",
  CdkDefaultRegion = "CDK_DEFAULT_REGION",
}

export interface CdkStackProps extends StackProps {
  readonly repoOwner: string;
  readonly repoName: string;
  readonly branch?: string;
  readonly githubToken: string;
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
      sourceAction: new GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: SecretValue.plainText(props.githubToken),
        owner: props.repoOwner,
        repo: props.repoName,
        branch: props.branch,
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
          [EnvVars.GithubToken]: { value: props.githubToken },
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
