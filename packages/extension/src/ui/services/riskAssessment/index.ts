import { messageClient } from "../trpc"
import { ClientRiskAssessmentService } from "./ClientRiskAssessmentService"

export const clientRiskAssessmentService = new ClientRiskAssessmentService(
  messageClient,
)
