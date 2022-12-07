import { TokenButton } from "@argent/ui"
import { ethers } from "ethers"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../../shared/token/price"
import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { toTokenView } from "../../accountTokens/tokens.service"
import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"

const TokenPrice: FC<{
  token: TokenDetailsWithBalance
  onClick: () => void
}> = ({ token, onClick }) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token,
    ethers.utils.parseEther("1"),
  )

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
      currencyValue={currencyValue}
      w="100%"
    />
  )
}

export { TokenPrice }
