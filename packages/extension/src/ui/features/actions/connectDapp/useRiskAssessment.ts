import { useCallback, useEffect, useState } from "react"

import { clientRiskAssessmentService } from "../../../services/riskAssessment"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { RiskAssessment } from "../../../../shared/riskAssessment/schema"

export interface IUseRiskAssessment {
  host: string
}

export const useRiskAssessment = ({ host }: IUseRiskAssessment) => {
  const currentNetwork = useCurrentNetwork()
  const [riskAssessment, setRiskAssessment] = useState<
    RiskAssessment | undefined
  >()
  const riskAssessmentFetcher = useCallback(async () => {
    const result = await clientRiskAssessmentService.assessRisk({
      dappContext: {
        dappDomain: host,
        network: currentNetwork.id,
      },
    })
    return result
  }, [currentNetwork.id, host])

  useEffect(() => {
    const fetchRiskAssessment = async () => {
      const data = await riskAssessmentFetcher()
      setRiskAssessment(data)
    }
    fetchRiskAssessment().catch((e) => {
      console.error("Error fetching risk assessment", e)
    })
  }, [riskAssessmentFetcher])
  return riskAssessment
}
