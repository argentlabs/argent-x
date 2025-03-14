import type { Address, TokenWithBalance } from "@argent/x-shared"
import { prettifyCurrencyValue, prettifyTokenAmount } from "@argent/x-shared"
import { getTokenIconUrl } from "@argent/x-ui"
import { useMemo, type FC } from "react"
import {
  useCurrencyDisplayEnabled,
  useTokenBalanceToCurrencyValue,
} from "../../../accountTokens/tokenPriceHooks"
import type { ButtonProps } from "@chakra-ui/react"
import type { TokenListItemVariant } from "../../../accountTokens/HideTokenListItem"
import { TokenListItem } from "../../../accountTokens/TokenListItem"
import { prettifyTokenBalance } from "../../../../../shared/token/prettifyTokenBalance"

function toTokenView(token: TokenWithBalance): {
  address: Address
  name: string
  symbol: string
  balance: string
  iconUrl: string
} {
  return {
    ...token,
    iconUrl: getTokenIconUrl(token),
    balance: `${prettifyTokenAmount({ ...token, amount: token.balance })}`,
  }
}

export interface MinBalances {
  [address: Address]: bigint
}

interface FeeTokenOptionContainerProps extends ButtonProps {
  token: TokenWithBalance
  minBalances: MinBalances
  onFeeTokenSelect: (token: TokenWithBalance) => void
  ref?: React.Ref<HTMLDivElement>
  variant?: TokenListItemVariant
}

export const FeeTokenOptionContainer: FC<FeeTokenOptionContainerProps> = ({
  token,
  minBalances,
  onFeeTokenSelect,
  ref,
  ...props
}) => {
  const { name, iconUrl, symbol, address } = toTokenView(token)
  const showCurrencyValue = useCurrencyDisplayEnabled()
  const tokenListVariant = showCurrencyValue ? "default" : "no-currency"
  const currencyValue = useTokenBalanceToCurrencyValue(token)
  const ccyBalance = prettifyCurrencyValue(currencyValue)
  const balance = prettifyTokenBalance(token)
  const minBalance = minBalances[token.address] ?? BigInt(1)

  const errorText = useMemo(
    () => (minBalance > token.balance ? "Insufficient funds" : undefined),
    [minBalance, token.balance],
  )

  return (
    <TokenListItem
      ref={ref}
      key={address}
      name={name}
      iconUrl={iconUrl}
      symbol={symbol}
      balance={balance}
      currencyValue={showCurrencyValue && ccyBalance ? ccyBalance : undefined}
      errorText={errorText}
      variant={tokenListVariant}
      onClick={() => onFeeTokenSelect(token)}
      {...props}
    />
  )
}
