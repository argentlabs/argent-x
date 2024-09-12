import type { ArraySignatureType } from "starknet"

export interface ReferralPayload {
  accountAddress: string
  ownerAddress: string
  signature: ArraySignatureType
}

export interface IReferralService {
  trackReferral: (referralPayload: ReferralPayload) => Promise<void>
}
