import { getJwt } from "./jwt"

export const ARGENT_API_BASE_URL = process.env.ARGENT_API_BASE_URL as string

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

export const cosignerSign: Cosigner = async (message: CosignerMessage) => {
  const jwt = await getJwt()
  const response = await fetch(`${ARGENT_API_BASE_URL}/cosigner/sign`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    throw new Error("failed to cosign")
  }
  const json = await response.json()
  return json
}
