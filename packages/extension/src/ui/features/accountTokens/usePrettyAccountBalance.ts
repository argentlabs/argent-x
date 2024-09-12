import { prettifyCurrencyValue } from "@argent/x-shared"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import { useTokensWithBalance } from "./tokens.state"

export const usePrettyAccountBalance = (account?: BaseWalletAccount) => {
  const tokenDetails = useTokensWithBalance(account)
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  if (sumCurrencyValue === undefined) {
    return
  }
  const prettyAccountBalance = prettifyCurrencyValue(sumCurrencyValue)
  if (!prettyAccountBalance) {
    return
  }
  return prettyAccountBalance
}
