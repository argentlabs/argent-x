import type { ArraySignatureType, typedData } from "starknet"

export interface SignMessageOptions {
  skipDeploy: boolean
}

export type ActionMessage =
  | {
      type: "SIGN_MESSAGE"
      data: { typedData: typedData.TypedData; options: SignMessageOptions }
    }
  | { type: "SIGN_MESSAGE_RES"; data: { actionHash: string } }
  | { type: "SIGNATURE_FAILURE"; data: { actionHash: string } }
  | {
      type: "SIGNATURE_SUCCESS"
      data: { signature: ArraySignatureType; actionHash: string }
    }
