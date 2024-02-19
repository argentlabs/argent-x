import { messageClient } from "../messaging/trpc"
import { ClientRiskAssessmentService } from "./client"

export const clientRiskAssessmentService = new ClientRiskAssessmentService(
  messageClient,
)
