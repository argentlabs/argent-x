import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum RISK_ASSESSMENT_ERROR_MESSAGE {
  ERROR_FETCHING = "Encountered an error while fetching risk assessment",
}

export type RiskAssessmentErrorMessage =
  keyof typeof RISK_ASSESSMENT_ERROR_MESSAGE

export class RiskAssessmentError extends BaseError<RiskAssessmentErrorMessage> {
  constructor(payload: BaseErrorPayload<RiskAssessmentErrorMessage>) {
    super(payload, RISK_ASSESSMENT_ERROR_MESSAGE)
    this.name = "RiskAssessmentError"
  }
}
