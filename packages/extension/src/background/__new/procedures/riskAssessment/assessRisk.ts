import { extensionOnlyProcedure } from "../permissions"
import { dappContextSchema } from "../../../../shared/riskAssessment/interface"

export const assessRiskProcedure = extensionOnlyProcedure
  .input(dappContextSchema)
  .query(
    async ({
      input: dappContext,
      ctx: {
        services: { riskAssessmentService },
      },
    }) => {
      return riskAssessmentService.assessRisk({ dappContext })
    },
  )
