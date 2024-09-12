import { router } from "../../trpc"
import { assessRiskProcedure } from "./assessRisk"

export const riskAssessmentRouter = router({
  assessRisk: assessRiskProcedure,
})
