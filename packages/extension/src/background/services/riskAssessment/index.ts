import { httpService } from "../../../shared/http/singleton"
import BackgroundRiskAssessmentService from "./BackgroundRiskAssessmentService"

export const riskAssessmentService = new BackgroundRiskAssessmentService(
  httpService,
)
