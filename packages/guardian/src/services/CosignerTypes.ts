export interface CosignerMessage {
  message: any
  type: "starknet" | "starknetDeploy"
}

export interface CosignerResponse {
  signature: {
    r: string
    s: string
  }
}

export type Cosigner = (message: CosignerMessage) => Promise<CosignerResponse>
