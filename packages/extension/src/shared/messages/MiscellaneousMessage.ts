import type { JWK } from "jose"

export type MiscenalleousMessage =
  | { type: "OPEN_UI" }
  | { type: "RESET_ALL" }
  | { type: "GET_PUBLIC_KEY" }
  | { type: "GET_PUBLIC_KEY_RES"; data: JWK }
  | { type: "EXPORT_PRIVATE_KEY" }
  | {
      type: "EXPORT_PRIVATE_KEY_RES"
      data: { privateKey: string }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE"
      data: { encryptedSecret: string }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE_RES"
      data: { encryptedSeedPhrase: string }
    }
