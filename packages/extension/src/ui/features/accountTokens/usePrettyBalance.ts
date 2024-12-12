import { prettifyCurrencyValue } from "@argent/x-shared"

import type { TokenWithOptionalBigIntBalance } from "../../../shared/token/__new/types/tokenBalance.model"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import {
  useTokensWithBalanceForAccount,
  useTokensWithBalanceForNetwork,
} from "./tokens.state"

const usePrettyTokenSumBalancesToCurrencyValue = (
  tokens: TokenWithOptionalBigIntBalance[],
) => {
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokens)
  if (sumCurrencyValue === undefined) {
    return
  }
  const prettyValue = prettifyCurrencyValue(sumCurrencyValue)
  if (!prettyValue) {
    return
  }
  return prettyValue
}

export const usePrettyBalanceForAccount = (account?: BaseWalletAccount) => {
  const tokens = useTokensWithBalanceForAccount(account)
  const prettyBalance = usePrettyTokenSumBalancesToCurrencyValue(tokens)
  return prettyBalance
}

export const usePrettyBalanceForNetwork = (networkId: string) => {
  const tokens = useTokensWithBalanceForNetwork(networkId)
  const prettyBalance = usePrettyTokenSumBalancesToCurrencyValue(tokens)
  return prettyBalance
}
