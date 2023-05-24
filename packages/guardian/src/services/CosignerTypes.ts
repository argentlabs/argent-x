import { typedData } from "starknet"
import { z } from "zod"

export interface CosignerMessage {
  message: any
  type: "starknet" | "starknetDeploy"
}

export interface CosignerOffchainMessage {
  chain: string
  accountAddress: string
  message: typedData.TypedData
}

export const CosignerResponseSchema = z.object({
  signature: z.object({
    r: z.string(),
    s: z.string(),
  }),
})

export type CosignerResponse = z.infer<typeof CosignerResponseSchema>

export type Cosigner = (
  message: CosignerMessage | CosignerOffchainMessage,
  isOffchainMessage?: boolean,
) => Promise<CosignerResponse>
