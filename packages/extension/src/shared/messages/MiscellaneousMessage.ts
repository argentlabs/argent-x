import type { JWK } from "jose"

export type MiscenalleousMessage =
  | { type: "OPEN_UI" }
  | { type: "RESET_ALL" }
  | { type: "GET_MESSAGING_PUBLIC_KEY" }
  | { type: "GET_MESSAGING_PUBLIC_KEY_RES"; data: JWK }
