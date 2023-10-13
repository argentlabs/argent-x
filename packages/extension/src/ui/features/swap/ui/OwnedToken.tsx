import { addressSchema } from "@argent/shared"
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
import { FC } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../../shared/token/price"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"

interface OwnedTokenProps {
  currency: Currency
  onClick: () => void
}

const OwnedToken: FC<OwnedTokenProps> = ({ onClick, currency }) => {
  const account = useView(selectedAccountView)

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

  const tokenDetailsWithBalance: TokenWithOptionalBigIntBalance = {
    name: token.name || "",
    symbol: token.symbol || "",
    decimals: token.decimals,
    address: addressSchema.parse(token.address),
    networkId: token.networkId,
    iconUrl: tokenImage,
    balance: BigInt(balance?.raw.toString() || "0"),
  }

  const displayBalance = prettifyTokenBalance(tokenDetailsWithBalance)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)

  return (
    <TokenButton
      onClick={onClick}
      name={tokenDetailsWithBalance.name}
      image={tokenDetailsWithBalance.iconUrl || ""}
      getTokenIconUrl={getTokenIconUrl}
      symbol={tokenDetailsWithBalance.symbol}
      showTokenSymbol
      valueLabelPrimary={displayBalance}
      valueLabelSecondary={displayCurrencyValue}
      w="100%"
    />
  )
}

export { OwnedToken }
