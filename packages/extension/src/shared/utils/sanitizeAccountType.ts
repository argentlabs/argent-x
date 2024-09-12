import { ArgentAccountType } from "../wallet.model"

type SanitizedAccountType = "standard" | "smart" | "multisig"

export const sanitizeAccountType = (
  type: ArgentAccountType | undefined,
): SanitizedAccountType => {
  if (!type) {
    return "standard"
  }

  if (["standard", "smart", "multisig"].includes(type)) {
    return type as SanitizedAccountType
  }

  return "standard"
}
