import { WalletAccount } from "../wallet.model"

export type SessionMessage =
  | { type: "STOP_SESSION" }
  | { type: "HAS_SESSION" }
  | { type: "HAS_SESSION_RES"; data: boolean }
  | { type: "IS_INITIALIZED" }
  | {
      type: "IS_INITIALIZED_RES"
      data: { initialized: boolean }
    }
  | { type: "START_SESSION"; data: { secure: true; body: string } }
  | { type: "START_SESSION_REJ" }
  | { type: "START_SESSION_RES"; data?: WalletAccount }
  | { type: "LOADING_PROGRESS"; data: number }
  | { type: "CHECK_PASSWORD"; data: { body: string } }
  | { type: "CHECK_PASSWORD_REJ" }
  | { type: "CHECK_PASSWORD_RES" }
