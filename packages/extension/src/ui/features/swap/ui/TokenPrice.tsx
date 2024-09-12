import { P4, TokenButton, getTokenIconUrl } from "@argent/x-ui"
import { FC } from "react"

import {
  useTokenAmountToCurrencyValue,
  useTokenPriceDetails,
} from "../../accountTokens/tokenPriceHooks"
import {
  bigDecimal,
  ensureDecimals,
  prettifyCurrencyValue,
} from "@argent/x-shared"
import { Token } from "../../../../shared/token/__new/types/token.model"

interface TokenPriceProps {
  token: Token
  onClick: () => void
  showCurrencyValue?: boolean
}

const TokenPrice: FC<TokenPriceProps> = ({ token, onClick }) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token,
    bigDecimal.parseUnits("1", ensureDecimals(token?.decimals)).value,
  )

  const priceDetails = useTokenPriceDetails(token)

  if (!token) {
    return <></>
  }

  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)

  const displayPriceDetails =
    parseFloat(priceDetails?.ccyDayChange || "0") * 100

  return (
    <TokenButton
      onClick={onClick}
      name={token.name || ""}
      image={token.iconUrl || ""}
      getTokenIconUrl={getTokenIconUrl}
      symbol={token.symbol || ""}
      showTokenSymbol
      valueLabelPrimary={displayCurrencyValue}
      valueLabelSecondary={
        priceDetails ? (
          <P4 color={displayPriceDetails > 0 ? "green" : "red"}>
            {displayPriceDetails.toFixed(2)}%
          </P4>
        ) : null
      }
      w="100%"
    />
  )
}

export { TokenPrice }
