import {
  DappContext,
  IRiskAssessmentService,
} from "../../../shared/riskAssessment/interface"

import { messageClient } from "../messaging/trpc"

export class ClientRiskAssessmentService implements IRiskAssessmentService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async assessRisk({ dappContext }: { dappContext: DappContext }) {
    return this.trpcClient.riskAssessment.assessRisk.query(dappContext)
  }
}
