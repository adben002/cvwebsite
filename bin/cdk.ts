#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { CdkStack, EnvVars } from "../lib/cdk-stack";

const env = process.env;

new CdkStack(new App(), "CdkStack", {
  repoOwner: env[EnvVars.RepoOwner]!,
  repoName: env[EnvVars.RepoName]!,
  branch: env[EnvVars.Branch],
  domainName: env[EnvVars.DomainName]!,
  env: {
    account: env[EnvVars.CdkDefaultAccount]!,
    region: env[EnvVars.CdkDefaultRegion]!,
  },
});
