import { RequestToken, Token } from "../token"

export type TokenMessage =
  | { type: "GET_TOKENS" }
  | { type: "GET_TOKENS_RES"; data: Token[] }
  | { type: "UPDATE_TOKENS"; data: Token[] }
  | { type: "REMOVE_TOKEN"; data: Token["address"] }
  | { type: "REMOVE_TOKEN_RES"; data: boolean }
  | { type: "ADD_TOKEN"; data: Token }
  | { type: "ADD_TOKEN_RES"; data: boolean }
  | { type: "ADD_TOKEN_REJ" }

  // - used by dapps to request tokens
  | { type: "REQUEST_TOKEN"; data: RequestToken }
  | { type: "REQUEST_TOKEN_RES"; data: { actionHash?: string } } // returns no actionHash if the token already exists
  | { type: "REJECT_REQUEST_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_REQUEST_TOKEN"; data: { actionHash: string } }
