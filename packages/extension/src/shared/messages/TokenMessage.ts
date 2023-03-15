import { RequestToken } from "../token/type"

export type TokenMessage =
  // - used by dapps to request tokens
  | { type: "ARGENT_REQUEST_TOKEN"; data: RequestToken }
  | { type: "REQUEST_TOKEN_RES"; data: { actionHash?: string } } // returns no actionHash if the token already exists
  | { type: "REJECT_REQUEST_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_REQUEST_TOKEN"; data: { actionHash: string } }
