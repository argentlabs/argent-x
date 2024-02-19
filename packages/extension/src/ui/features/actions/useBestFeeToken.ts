import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { useAccount } from "../accounts/accounts.state"
import { TokenWithBalance, isEqualAddress } from "@argent/shared"
import {
  classHashSupportsTxV3,
  feeTokenNeedsTxV3Support,
} from "../../../shared/network/txv3"
import { tokenBalancesForAccountView } from "../../views/tokenBalances"
import { equalToken } from "../../../shared/token/__new/utils"
import { AccountError } from "../../../shared/errors/account"
import { num } from "starknet"
import { FeeTokenPreferenceOption } from "../../../shared/feeToken/types/preference.model"
import { pickBestFeeToken } from "../../../shared/feeToken/utils"
import { useFeeTokenPreference } from "./useFeeTokenPreference"

export const useBestFeeToken = (
  baseAccount: BaseWalletAccount | undefined,
  overrides: FeeTokenPreferenceOption = {},
) => {
  const tokens = useTokensInNetwork(baseAccount?.networkId)
  const account = useAccount(baseAccount)

  const { prefer: userPreference } = useFeeTokenPreference()

  if (!account) {
    throw new AccountError({ code: "NOT_FOUND" })
  }

  const { classHash, network } = account

  const networkFeeTokens = tokens.filter((token) =>
    network.possibleFeeTokenAddresses.some((ft) =>
      isEqualAddress(ft, token.address),
    ),
  )
  const accountFeeTokens = networkFeeTokens.filter((token) => {
    if (feeTokenNeedsTxV3Support(token)) {
      return classHashSupportsTxV3(classHash)
    }
    return true
  })

  const tokenBalancesForAccount = useView(tokenBalancesForAccountView(account))

  const feeTokensWithBalances: TokenWithBalance[] = accountFeeTokens.map(
    (token) => {
      const tokenBalance = tokenBalancesForAccount?.find((tb) =>
        equalToken(tb, token),
      )
      return {
        ...token,
        balance: num.toBigInt(tokenBalance?.balance ?? 0),
      }
    },
  )
  // Optimized by ensuring overrides.prefer is always an array before spreading
  return pickBestFeeToken(feeTokensWithBalances, {
    prefer: [...(overrides.prefer || []), userPreference],
    avoid: overrides.avoid,
  })
}
