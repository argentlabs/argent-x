import { L2 } from "@argent/ui"
import { WrappedTokenInfo } from "@argent/x-swap"
import { ethers } from "ethers"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"

interface CurrencyValueProps {
  amount: string
  approx?: boolean
  token: WrappedTokenInfo
}

const CurrencyValue: FC<CurrencyValueProps> = ({ amount, approx, token }) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token as Token,
    amount ? ethers.utils.parseEther(amount) : 0,
  )

  return (
    <L2 color="neutrals.400">
      {approx && <>≈ </>}
      {prettifyCurrencyValue(currencyValue)}
    </L2>
  )
}

export { CurrencyValue }
