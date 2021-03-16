# Welcome to your CDK TypeScript project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

```bash
(cd /tmp && env CDK_NEW_BOOTSTRAP=1 npx cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess "aws://${AWS_ACCOUNT}/${AWS_REGION}")

env REPO_OWNER="$REPO_OWNER" REPO_NAME="$REPO_NAME" BRANCH="$BRANCH" GITHUB_TOKEN="$GITHUB_TOKEN" DOMAIN_NAME="$DOMAIN_NAME" CDK_DEFAULT_ACCOUNT="$AWS_ACCOUNT" CDK_DEFAULT_REGION="$AWS_REGION" cdk deploy CdkStack
```
