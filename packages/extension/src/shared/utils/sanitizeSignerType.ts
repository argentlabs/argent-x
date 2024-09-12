import { SignerType } from "../wallet.model"

type SanitizedSignerType = "argent" | "ledger"

export const sanitizeSignerType = (type: SignerType): SanitizedSignerType => {
  switch (type) {
    case SignerType.LOCAL_SECRET:
      return "argent"
    case SignerType.LEDGER:
      return "ledger"
    default:
      throw new Error(`Unknown signer type: ${type}`)
  }
}
