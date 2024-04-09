import { L2 } from "@argent/x-ui"
import { FC } from "react"

import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { bigDecimal, prettifyCurrencyValue } from "@argent/x-shared"
import { Token } from "../../../../shared/token/__new/types/token.model"

interface TokenValueProps {
  amount: string
  approx?: boolean
  token: Token
}

export const TokenValue: FC<TokenValueProps> = ({ amount, approx, token }) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token,
    amount ? bigDecimal.parseUnits(amount, token.decimals).value : 0,
  )

  return (
    <L2 color="neutrals.400">
      {approx && <>≈ </>}
      {prettifyCurrencyValue(currencyValue)}
    </L2>
  )
}
