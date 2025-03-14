import type { TokenWithBalance } from "@argent/x-shared"
import {
  bigDecimal,
  estimatedFeesToMaxFeeTotalV2,
  estimatedFeesToTotalV2,
} from "@argent/x-shared"
import { useMemo } from "react"
import { prettifyCurrencyValue, prettifyTokenAmount } from "@argent/x-shared"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import {
  useCurrencyDisplayEnabled,
  useTokenAmountToCurrencyValue,
} from "../../accountTokens/tokenPriceHooks"

interface UseFeeAmountProps {
  fee?: EstimatedFeesV2
  feeToken: TokenWithBalance
  isSubsidised?: boolean
  floorValue?: string
}

const formatFeeValue = (
  amount: bigint | undefined,
  currencyValue: string | undefined,
  token?: TokenWithBalance,
  floorValue?: string,
) => {
  if (!amount) return null

  if (currencyValue) {
    const isLessThanFloor = floorValue
      ? bigDecimal.lt(
          bigDecimal.parseCurrency(currencyValue),
          bigDecimal.parseCurrency(floorValue),
        )
      : false

    return isLessThanFloor
      ? ` < $${floorValue}`
      : prettifyCurrencyValue(currencyValue)
  }

  return prettifyTokenAmount({
    amount,
    decimals: token?.decimals || 0,
    symbol: token?.symbol || "",
  })
}

export const useFeeAmount = ({
  fee,
  feeToken,
  isSubsidised = false,
  floorValue = "0.01",
}: UseFeeAmountProps) => {
  const amount = fee && estimatedFeesToTotalV2(fee)
  const maxFee = fee && estimatedFeesToMaxFeeTotalV2(fee)
  const showCurrencyValue = useCurrencyDisplayEnabled()
  const currencyValueToken = showCurrencyValue ? feeToken : undefined
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    currencyValueToken,
    amount,
  )
  const maxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    currencyValueToken,
    maxFee,
  )

  const feeAmount = useMemo(() => {
    const formatted = formatFeeValue(
      amount,
      amountCurrencyValue,
      feeToken,
      floorValue,
    )
    if (!formatted) return null

    return (
      <Flex gap={1} cursor="pointer">
        <Text textDecoration={isSubsidised ? "line-through" : undefined}>
          {formatted}
        </Text>
        {isSubsidised && <Text> $0.00</Text>}
      </Flex>
    )
  }, [amount, amountCurrencyValue, feeToken, floorValue, isSubsidised])

  const toolTipText = useMemo(() => {
    if (!amount || !maxFee) return null

    const estimatedFee = formatFeeValue(amount, amountCurrencyValue, feeToken)
    const maxEstimatedFee = formatFeeValue(
      maxFee,
      maxFeeCurrencyValue,
      feeToken,
    )

    return (
      <Flex direction="column" gap={1}>
        <Text>Estimated fee: {estimatedFee}</Text>
        <Text>Max fee: {maxEstimatedFee}</Text>
      </Flex>
    )
  }, [amount, maxFee, amountCurrencyValue, maxFeeCurrencyValue, feeToken])

  // For subsidised fees, return the fee amount directly
  if (isSubsidised) {
    return feeAmount
  }

  // Otherwise, wrap it in a tooltip showing detailed fee information
  return (
    <Tooltip label={toolTipText} placement="top-start">
      {feeAmount}
    </Tooltip>
  )
}
