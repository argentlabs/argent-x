import { TokenButton } from "@argent/ui"
import { WrappedTokenInfo } from "@argent/x-swap"
import { BigNumberish } from "ethers"
import { FC } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../../shared/token/price"
import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"

interface OwnedTokenProps {
  token: TokenDetailsWithBalance
  amount: BigNumberish
  onClick: () => void
}

const OwnedToken: FC<OwnedTokenProps> = ({ amount, onClick, token }) => {
  const currencyValue = useTokenAmountToCurrencyValue(token, amount)

  /* TODO: unify token types -- too many at the moment and it will involve a big refactor */
  const {
    name,
    symbol,
    tokenInfo: { image },
  } = token as WrappedTokenInfo
  const displayBalance = prettifyTokenBalance(token)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)

  return (
    <TokenButton
      onClick={onClick}
      name={name || ""}
      image={image || ""}
      getTokenIconUrl={getTokenIconUrl}
      symbol={symbol || ""}
      showTokenSymbol
      valueLabelPrimary={displayBalance}
      valueLabelSecondary={displayCurrencyValue}
      currencyValue={currencyValue}
      w="100%"
    />
  )
}

export { OwnedToken }
