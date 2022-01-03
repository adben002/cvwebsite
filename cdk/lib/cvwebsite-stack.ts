import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import CvWebsiteApplicationStage from './cvwebsite-application';

export default class CvWebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('adben002/cvwebsite', 'main', {
          authentication: SecretValue.secretsManager('github-token', {
            jsonField: 'cvwebsite',
          }),
        }),
        commands: [
          'export DEPLOY=true',
          CvWebsiteStack.runNodeScripts('ci'),
          CvWebsiteStack.runNodeScripts('run lint'),
          CvWebsiteStack.runNodeScripts('run build'),
          'cd "$CODEBUILD_SRC_DIR/cdk" && npx cdk synth',
        ],
      }),
    });

    if (process.env.DEPLOY === 'true') {
      pipeline.addStage(new CvWebsiteApplicationStage(this, 'CvWebsiteApplicationStage'));
    }
  }

  private static runNodeScripts(script: string): string {
    return `cd "$CODEBUILD_SRC_DIR/cdk" && npm ${script} && cd "$CODEBUILD_SRC_DIR/app" && npm ${script}`;
  }
}
