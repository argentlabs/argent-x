import { httpService } from "../../../../shared/http/singleton"
import BackgroundRiskAssessmentService from "./background"

export const riskAssessmentService = new BackgroundRiskAssessmentService(
  httpService,
)
