import { TokenButton } from "@argent/ui"
import { WrappedTokenInfo } from "@argent/x-swap"
import { Text } from "@chakra-ui/react"
import { ethers } from "ethers"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../../shared/token/price"
import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import {
  useTokenAmountToCurrencyValue,
  useTokenPriceDetails,
} from "../../accountTokens/tokenPriceHooks"
import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"

interface TokenPriceProps {
  token: TokenDetailsWithBalance
  onClick: () => void
}

const TokenPrice: FC<TokenPriceProps> = ({ token, onClick }) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token,
    ethers.utils.parseUnits("1", token.decimals),
  )

  const priceDetails = useTokenPriceDetails(token)

  /* TODO: unify token types -- too many at the moment and it will involve a big refactor */
  const {
    name,
    symbol,
    tokenInfo: { image },
  } = token as WrappedTokenInfo
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)

  return (
    <TokenButton
      onClick={onClick}
      name={name || ""}
      image={image || ""}
      getTokenIconUrl={getTokenIconUrl}
      symbol={symbol || ""}
      showTokenSymbol
      valueLabelPrimary={displayCurrencyValue}
      valueLabelSecondary={
        priceDetails ? (
          <Text color={+priceDetails.ccyDayChange > 0 ? "green" : "red"}>
            {priceDetails.ccyDayChange}%
          </Text>
        ) : null
      }
      currencyValue={currencyValue}
      w="100%"
    />
  )
}

export { TokenPrice }
