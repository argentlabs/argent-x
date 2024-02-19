import { TokenWithBalance } from "../../../../../shared/token/__new/types/tokenBalance.model"
import { TokenOption } from "../../../../components/TokenOption"
import { getTokenIconUrl } from "../../../accountTokens/TokenIcon"
import { num } from "starknet"
import { FC, useCallback, useMemo, useState } from "react"
import {
  useCurrencyDisplayEnabled,
  useTokenBalanceToCurrencyValue,
} from "../../../accountTokens/tokenPriceHooks"
import { Address, prettifyCurrencyValue } from "@argent/shared"
import {
  classHashSupportsTxV3,
  feeTokenNeedsTxV3Support,
} from "../../../../../shared/network/txv3"
import { useAccount } from "../../../accounts/accounts.state"
import { clientAccountService } from "../../../../services/account"
import { AccountError } from "../../../../../shared/errors/account"
import { isEmpty } from "lodash-es"
import { prettifyTokenAmount } from "../../../../../shared/token/price"
import { useUpgradeAccountTransactions } from "../../../accounts/accountTransactions.state"
import { accountService } from "../../../../../shared/account/service"
import { accountsEqual } from "../../../../../shared/utils/accountsEqual"
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
  const account = useAccount(token.account)
  const { name, iconUrl, symbol, address, balance } = toTokenView(token)
  const showCurrencyValue = useCurrencyDisplayEnabled()
  const currencyValue = useTokenBalanceToCurrencyValue(token)
  const ccyBalance = prettifyCurrencyValue(currencyValue)
  const minBalance = minBalances[token.address] ?? BigInt(1)
  const { pendingTransactions: pendingUpgradeTransactions } =
    useUpgradeAccountTransactions(account)

  const initLoading = useMemo(() => {
    if (!account) {
      return false
    }
    return (
      feeTokenNeedsTxV3Support(token) && !isEmpty(pendingUpgradeTransactions)
    )
  }, [account, pendingUpgradeTransactions, token])

  const [upgradeLoading, setUpgradeLoading] = useState(initLoading)

  const { data: requiresTxV3Upgrade } = useRequiresTxV3Upgrade(account, token)

  // disabled if the token balance is less than the min balance or the token requires a tx v3 upgrade
  const disabled =
    requiresTxV3Upgrade || num.toBigInt(token.balance) < minBalance

  const enableTxV3 = useCallback(async () => {
    setUpgradeLoading(true)
    if (!account) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }
    await clientAccountService.upgrade(account)
    setUpgradeLoading(false)
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
      onEnableTxV3={enableTxV3}
      upgradeLoading={upgradeLoading}
    />
  )
}
