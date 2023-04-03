import { typedData } from "starknet"

export interface CosignerMessage {
  message: any
  type: "starknet" | "starknetDeploy"
}

export interface CosignerOffchainMessage {
  chain: string
  accountAddress: string
  message: typedData.TypedData
}

export interface CosignerResponse {
  signature: {
    r: string
    s: string
  }
}

export type Cosigner = (
  message: CosignerMessage | CosignerOffchainMessage,
  isOffchainMessage?: boolean,
) => Promise<CosignerResponse>
