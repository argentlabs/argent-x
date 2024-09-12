import { z } from "zod"
import { warningSchema } from "@argent/x-shared/simulation"

const linkSchema = z.object({
  name: z.string(),
  url: z.string(),
  position: z.number(),
})

const contractSchema = z.object({
  address: z.string(),
  chain: z.string(),
})

const dappSchema = z.object({
  dappId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  iconUrl: z.string().optional(),
  argentVerified: z.boolean().default(false),
  dappDomain: z.string().optional(),
  isUnknown: z.boolean().default(true),
  links: z.array(linkSchema),
  contracts: z.array(contractSchema),
  urlSoundex: z.array(z.string()),
  unknown: z.boolean().default(true),
})

export const riskAssessmentSchema = z.object({
  dapp: dappSchema.optional(),
  warning: warningSchema.optional(),
  status: z.number().optional(),
  error: z.string().optional(),
})

export type Dapp = z.infer<typeof dappSchema>
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>
