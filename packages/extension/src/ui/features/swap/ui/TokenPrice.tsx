import { TokenButton } from "@argent/ui"
import { Text } from "@chakra-ui/react"
import { ethers } from "ethers"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../../shared/token/price"
import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import {
  useTokenAmountToCurrencyValue,
  useTokenPriceDetails,
} from "../../accountTokens/tokenPriceHooks"
import { toTokenView } from "../../accountTokens/tokens.service"
import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"

interface TokenPriceProps {
  token: TokenDetailsWithBalance
  onClick: () => void
}

const TokenPrice: FC<TokenPriceProps> = ({ token, onClick }) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token,
    ethers.utils.parseEther("1"),
  )

  const priceDetails = useTokenPriceDetails(token)

  const { name, image, symbol } = toTokenView(token)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)

  return (
    <TokenButton
      onClick={onClick}
      name={name}
      image={image || ""}
      getTokenIconUrl={getTokenIconUrl}
      symbol={symbol}
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
