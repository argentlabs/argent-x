import { IHttpService } from "@argent/x-shared"
import {
  DappContext,
  IRiskAssessmentService,
} from "../../../../shared/riskAssessment/interface"
import { RiskAssessment } from "../../../../shared/riskAssessment/schema"
import { ARGENT_TRANSACTION_REVIEW_API_BASE_URL } from "../../../../shared/api/constants"
import urlJoin from "url-join"
import { argentApiNetworkForNetwork } from "../../../../shared/api/headers"
import { RiskAssessmentError } from "../../../../shared/errors/riskAssessment"

const riskAssessmentBaseEndpoint = urlJoin(
  ARGENT_TRANSACTION_REVIEW_API_BASE_URL || "",
  "domains/info/starknet",
)

export default class BackgroundRiskAssessmentService
  implements IRiskAssessmentService
{
  constructor(private httpService: IHttpService) {}

  private getRiskAssessmentEndpoint({
    dappDomain,
    network,
  }: {
    dappDomain: string
    network: string
  }) {
    return `${riskAssessmentBaseEndpoint}/${argentApiNetworkForNetwork(
      network,
    )}?domain=${dappDomain}`
  }

  async assessRisk({ dappContext }: { dappContext: DappContext }) {
    try {
      const riskAssessmentEndpoint = this.getRiskAssessmentEndpoint(dappContext)
      const result = await this.httpService.get<RiskAssessment>(
        riskAssessmentEndpoint,
      )
      return result
    } catch (e) {
      throw new RiskAssessmentError({ code: "ERROR_FETCHING" })
    }
  }
}
