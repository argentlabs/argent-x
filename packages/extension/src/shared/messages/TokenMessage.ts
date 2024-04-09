import { RequestToken } from "../token/__new/types/token.model"

export type TokenMessage =
  // - used by dapps to request tokens
  | { type: "REQUEST_TOKEN"; data: RequestToken }
  | {
      type: "REQUEST_TOKEN_RES"
      data: { exists: boolean; actionHash?: string }
    } // returns no actionHash if the token already exists
  | { type: "REJECT_REQUEST_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_REQUEST_TOKEN"; data: { actionHash: string } }
