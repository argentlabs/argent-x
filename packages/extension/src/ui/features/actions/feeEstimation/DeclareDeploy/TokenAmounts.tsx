import { FC } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../../shared/token/price"
import {
  FieldValue,
  FieldValueGroup,
  FieldValueMeta,
} from "../../../../components/Fields"
import { useTokenAmountToCurrencyValue } from "../../../accountTokens/tokenPriceHooks"
import { FeeEstimationValue } from "../styled"

const TokenAmounts: FC<{ feeToken: any; fee: any }> = ({ feeToken, fee }) => {
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.maxADFee,
  )

  return (
    <FieldValueGroup>
      <FieldValue>
        {amountCurrencyValue !== undefined ? (
          <FeeEstimationValue>
            ~{prettifyCurrencyValue(amountCurrencyValue)}
          </FeeEstimationValue>
        ) : (
          <FeeEstimationValue>
            ~
            {feeToken ? (
              prettifyTokenAmount({
                amount: fee.amount,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{fee.amount} Unknown</>
            )}
          </FeeEstimationValue>
        )}
      </FieldValue>
      <FieldValueMeta>
        {suggestedMaxFeeCurrencyValue !== undefined ? (
          <FeeEstimationValue>
            Max ~{prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)}
          </FeeEstimationValue>
        ) : (
          <FeeEstimationValue>
            Max ~
            {feeToken ? (
              prettifyTokenAmount({
                amount: fee.maxADFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{fee.maxADFee} Unknown</>
            )}
          </FeeEstimationValue>
        )}
      </FieldValueMeta>
    </FieldValueGroup>
  )
}

export { TokenAmounts }
