import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { CvwebsitePipeline } from "../lib/cvwebsite-pipeline";

test("SQS Queue Created", () => {
  const app = new App();
  // WHEN
  const stack = new CvwebsitePipeline(app, "MyTestStack");
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 300,
  });
});
