import { z } from "zod"
import type { RiskAssessment } from "./schema"

export const dappContextSchema = z.object({
  dappDomain: z.string(),
  network: z.string(),
})

export type DappContext = z.infer<typeof dappContextSchema>

export interface IRiskAssessmentService {
  assessRisk({
    dappContext,
  }: {
    dappContext: DappContext
  }): Promise<RiskAssessment>
}
