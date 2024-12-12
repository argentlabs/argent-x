import type {
  DappContext,
  IRiskAssessmentService,
} from "../../../shared/riskAssessment/IRiskAssessmentService"

import type { messageClient } from "../trpc"

export class ClientRiskAssessmentService implements IRiskAssessmentService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async assessRisk({ dappContext }: { dappContext: DappContext }) {
    return this.trpcClient.riskAssessment.assessRisk.query(dappContext)
  }
}
