import type { Address } from "@argent/x-shared"
import { prettifyCurrencyValue, prettifyTokenAmount } from "@argent/x-shared"
import { getTokenIconUrl } from "@argent/x-ui"
import type { FC } from "react"
import { useCallback, useEffect, useState } from "react"
import { num } from "starknet"
import { AccountError } from "../../../../../shared/errors/account"
import type { TokenWithBalance } from "../../../../../shared/token/__new/types/tokenBalance.model"
import { TokenOption } from "../../../../components/TokenOption"
import { clientAccountService } from "../../../../services/account"
import {
  useCurrencyDisplayEnabled,
  useTokenBalanceToCurrencyValue,
} from "../../../accountTokens/tokenPriceHooks"
import { useHasPendingUpgradeAccountTransactions as useHasPendingUpgradeAccountTransactions } from "../../../accounts/accountTransactions.state"
import { useWalletAccount } from "../../../accounts/accounts.state"
import { useRequiresTxV3Upgrade } from "../useRequiresTxV3Upgrade"

function toTokenView(token: TokenWithBalance): {
  address: Address
  name: string
  symbol: string
  balance: string
  iconUrl: string
} {
  return {
    ...token,
    iconUrl: getTokenIconUrl({ ...token, url: token.iconUrl }),
    balance: `${prettifyTokenAmount({ ...token, amount: token.balance })}`,
  }
}

export interface MinBalances {
  [address: Address]: bigint
}

interface TokenOptionContainerProps {
  token: TokenWithBalance
  minBalances: MinBalances
  onFeeTokenSelect: (token: TokenWithBalance) => void
  ref?: React.Ref<HTMLDivElement>
}

export const TokenOptionContainer: FC<TokenOptionContainerProps> = ({
  token,
  minBalances,
  onFeeTokenSelect,
  ref,
}) => {
  const account = useWalletAccount(token.account.id)
  const { name, iconUrl, symbol, address, balance } = toTokenView(token)
  const showCurrencyValue = useCurrencyDisplayEnabled()
  const currencyValue = useTokenBalanceToCurrencyValue(token)
  const ccyBalance = prettifyCurrencyValue(currencyValue)
  const minBalance = minBalances[token.address] ?? BigInt(1)
  const hasUpgradeAccountTransactions =
    useHasPendingUpgradeAccountTransactions(account)

  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const { data: requiresTxV3Upgrade } = useRequiresTxV3Upgrade(account, token)

  useEffect(() => {
    setUpgradeLoading(!!requiresTxV3Upgrade && hasUpgradeAccountTransactions)
  }, [hasUpgradeAccountTransactions, requiresTxV3Upgrade])

  // disabled if the token balance is less than the min balance or the token requires a tx v3 upgrade
  const disabled =
    requiresTxV3Upgrade || num.toBigInt(token.balance) < minBalance

  const enableTxV3 = useCallback(async () => {
    setUpgradeLoading(true)
    if (!account) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }
    await clientAccountService.upgrade(account)
  }, [account])

  return (
    <TokenOption
      ref={ref}
      disabled={disabled}
      key={address}
      imageSrc={iconUrl}
      name={name}
      symbol={symbol}
      balance={balance}
      ccyBalance={showCurrencyValue && ccyBalance ? ccyBalance : undefined}
      errorText="Insufficient funds"
      requiresTxV3Upgrade={requiresTxV3Upgrade}
      onTokenSelect={() => onFeeTokenSelect(token)}
      onEnableTxV3={() => void enableTxV3()}
      upgradeLoading={upgradeLoading}
    />
  )
}
