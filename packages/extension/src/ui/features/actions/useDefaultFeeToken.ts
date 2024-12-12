import type { TokenWithBalance } from "@argent/x-shared"
import { num } from "starknet"
import { AccountError } from "../../../shared/errors/account"
import type { FeeTokenPreferenceOption } from "../../../shared/feeToken/types/preference.model"
import { pickBestFeeToken } from "../../../shared/feeToken/utils"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useFeeTokenBalances } from "../accountTokens/useFeeTokenBalance"
import { useFeeTokenPreference } from "./useFeeTokenPreference"

export const useDefaultFeeToken = (
  baseAccount: BaseWalletAccount | undefined,
  overrides: FeeTokenPreferenceOption = {},
): TokenWithBalance => {
  if (!baseAccount) {
    throw new AccountError({ code: "NOT_FOUND" })
  }

  const { prefer: userPreference } = useFeeTokenPreference()

  const feeTokensWithBalances = useFeeTokenBalances(baseAccount).map((tb) => {
    return { ...tb, balance: num.toBigInt(tb?.balance ?? 0) }
  })

  // Optimized by ensuring overrides.prefer is always an array before spreading
  return pickBestFeeToken(feeTokensWithBalances, baseAccount.networkId, {
    prefer: [...(overrides.prefer || []), userPreference],
    avoid: overrides.avoid,
  })
}
