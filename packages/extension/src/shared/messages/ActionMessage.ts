import type { ArraySignatureType } from "starknet"
import type { TypedData } from "@starknet-io/types-js"

export interface SignMessageOptions {
  skipDeploy: boolean
}

export type ActionMessage =
  | {
      type: "SIGN_MESSAGE"
      data: { typedData: TypedData; options: SignMessageOptions }
    }
  | { type: "SIGN_MESSAGE_RES"; data: { actionHash: string } }
  | { type: "SIGNATURE_FAILURE"; data: { actionHash: string; error: string } }
  | {
      type: "SIGNATURE_SUCCESS"
      data: { signature: ArraySignatureType; actionHash: string }
    }
  | {
      type: "SIGNATURES_PENDING"
      data: { requestId: string; actionHash: string }
    }
