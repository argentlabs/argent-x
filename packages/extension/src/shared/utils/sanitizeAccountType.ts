import type { WalletAccountType } from "../wallet.model"

type SanitizedAccountType = "standard" | "smart" | "multisig"

export const sanitizeAccountType = (
  type: WalletAccountType | undefined,
): SanitizedAccountType => {
  if (!type) {
    return "standard"
  }

  if (["standard", "smart", "multisig"].includes(type)) {
    return type as SanitizedAccountType
  }

  return "standard"
}
