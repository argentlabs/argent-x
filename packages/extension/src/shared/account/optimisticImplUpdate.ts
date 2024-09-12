import {
  Address,
  isEqualAddress,
  getArgentAccountClassHashes,
} from "@argent/x-shared"
import { WalletAccount } from "../wallet.model"

// Use this with caution, as it might not reflect the onchain state,
// but just an optimistic update
export const optimisticImplUpdate = (
  account: WalletAccount,
  newClassHash?: Address,
): WalletAccount => {
  if (!newClassHash) return account

  const [CAIRO_0, CAIRO_1] = [
    getArgentAccountClassHashes("cairo0"),
    getArgentAccountClassHashes("cairo1"),
  ]

  const cairoVersion = CAIRO_1.some((c1) => isEqualAddress(c1, newClassHash))
    ? "1"
    : CAIRO_0.some((c0) => isEqualAddress(c0, newClassHash))
      ? "0"
      : account.cairoVersion // fallback to the current account's cairo version

  return { ...account, classHash: newClassHash, cairoVersion }
}
