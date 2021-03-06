import { Construct, Stage, StageProps } from "@aws-cdk/core";
import { CvSite } from "./pipelines_webinar_stack";

export interface WebServiceStageProps extends StageProps {
  domainName: string;
}

export class WebServiceStage extends Stage {
  constructor(scope: Construct, id: string, props: WebServiceStageProps) {
    super(scope, id, props);

    new CvSite(this, "WebService", {
      domainName: props.domainName,
    });
  }
}
