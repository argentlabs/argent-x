import { L2 } from "@argent/ui"
import { WrappedTokenInfo } from "@argent/x-swap"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../../shared/token/price"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { bigDecimal } from "@argent/shared"
import { Token } from "../../../../shared/token/__new/types/token.model"

interface CurrencyValueProps {
  amount: string
  approx?: boolean
  token: WrappedTokenInfo
}

const CurrencyValue: FC<CurrencyValueProps> = ({ amount, approx, token }) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token as Token,
    amount ? bigDecimal.parseUnits(amount, token.decimals).value : 0,
  )

  return (
    <L2 color="neutrals.400">
      {approx && <>≈ </>}
      {prettifyCurrencyValue(currencyValue)}
    </L2>
  )
}

export { CurrencyValue }
