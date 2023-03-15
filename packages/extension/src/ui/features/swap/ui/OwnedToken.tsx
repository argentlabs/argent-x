import { TokenButton } from "@argent/ui"
import {
  Currency,
  ETHER,
  ETH_LOGO_URL,
  SupportedNetworks,
  WrappedTokenInfo,
  useCurrencyBalance,
  wrappedCurrency,
} from "@argent/x-swap"
import { BigNumber } from "ethers"
import { FC } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../../shared/token/price"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"

interface OwnedTokenProps {
  currency: Currency
  onClick: () => void
}

const OwnedToken: FC<OwnedTokenProps> = ({ onClick, currency }) => {
  const account = useSelectedAccount()

  const token = wrappedCurrency(
    currency,
    account?.networkId as SupportedNetworks,
  )

  const balance = useCurrencyBalance(account?.address, token)

  const currencyValue = useTokenAmountToCurrencyValue(
    token,
    balance?.raw.toString(),
  )

  if (!token) {
    return <></>
  }

  const tokenImage =
    token instanceof WrappedTokenInfo
      ? token.image
      : currency === ETHER
      ? ETH_LOGO_URL
      : undefined

  const tokenDetailsWithBalance: TokenDetailsWithBalance = {
    name: token.name || "",
    symbol: token.symbol || "",
    decimals: token.decimals,
    address: token.address,
    networkId: token.networkId,
    image: tokenImage,
    balance: BigNumber.from(balance?.raw.toString() || "0"),
  }

  const displayBalance = prettifyTokenBalance(tokenDetailsWithBalance)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)

  return (
    <TokenButton
      onClick={onClick}
      name={tokenDetailsWithBalance.name}
      image={tokenDetailsWithBalance.image || ""}
      getTokenIconUrl={getTokenIconUrl}
      symbol={tokenDetailsWithBalance.symbol}
      showTokenSymbol
      valueLabelPrimary={displayBalance}
      valueLabelSecondary={displayCurrencyValue}
      currencyValue={currencyValue}
      w="100%"
    />
  )
}

export { OwnedToken }
