import { L1, TextWithAmount } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { FC } from "react"

import { Field, FieldKey, LeftPaddedField } from "../../../../components/Fields"
import { useNetworkFeeToken } from "../../../accountTokens/tokens.state"
import { useDisplayTokenAmountAndCurrencyValue } from "../../../accountTokens/useDisplayTokenAmountAndCurrencyValue"

interface FeeFieldProps {
  title?: string
  fee: string
  networkId: string
}

export const FeeField: FC<FeeFieldProps> = ({
  title = "Network fee",
  fee,
  networkId,
}) => {
  const feeToken = useNetworkFeeToken(networkId)
  const { displayAmount, displayValue } = useDisplayTokenAmountAndCurrencyValue(
    { amount: fee, tokenAddress: feeToken?.address },
  )
  if (!feeToken) {
    return null
  }
  return (
    <Field>
      <FieldKey>{title}</FieldKey>
      <LeftPaddedField>
        <TextWithAmount amount={fee} decimals={feeToken.decimals}>
          <Box textAlign={"right"}>{displayAmount}</Box>
        </TextWithAmount>
        {displayValue && <L1 color={"neutrals.400"}>{displayValue}</L1>}
      </LeftPaddedField>
    </Field>
  )
}
