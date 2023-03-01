import { TextWithAmount } from "@argent/ui"
import { FC, useMemo } from "react"
import { number } from "starknet"

import { EstimateFeeResponse } from "../../../../../shared/messages/TransactionMessage"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../../shared/token/price"
import { Token } from "../../../../../shared/token/type"
import {
  FieldValue,
  FieldValueGroup,
  FieldValueMeta,
} from "../../../../components/Fields"
import { useTokenAmountToCurrencyValue } from "../../../accountTokens/tokenPriceHooks"
import { FeeEstimationValue } from "../styled"

const TokenAmounts: FC<{
  feeToken: Token
  fee: EstimateFeeResponse
  needsDeploy?: boolean
}> = ({ feeToken, fee, needsDeploy }) => {
  const totalFee = useMemo(() => {
    if (needsDeploy && fee?.accountDeploymentFee) {
      return number.toHex(
        number.toBN(fee.accountDeploymentFee).add(number.toBN(fee.amount)),
      )
    }
    return fee?.amount
  }, [needsDeploy, fee?.accountDeploymentFee, fee?.amount])

  const totalMaxFee = useMemo(() => {
    if (needsDeploy && fee?.maxADFee) {
      return number.toHex(
        number.toBN(fee.maxADFee).add(number.toBN(fee.suggestedMaxFee)),
      )
    }
    return fee?.suggestedMaxFee
  }, [needsDeploy, fee?.maxADFee, fee?.suggestedMaxFee])

  const amountCurrencyValue = useTokenAmountToCurrencyValue(feeToken, totalFee)

  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    totalMaxFee,
  )

  return (
    <FieldValueGroup>
      <FieldValue>
        {amountCurrencyValue !== undefined ? (
          <FeeEstimationValue>
            ~{prettifyCurrencyValue(amountCurrencyValue)}
          </FeeEstimationValue>
        ) : (
          <TextWithAmount amount={totalFee}>
            <FeeEstimationValue>
              ~
              {feeToken ? (
                prettifyTokenAmount({
                  amount: totalFee,
                  decimals: feeToken.decimals,
                  symbol: feeToken.symbol,
                })
              ) : (
                <>{totalFee} Unknown</>
              )}
            </FeeEstimationValue>
          </TextWithAmount>
        )}
      </FieldValue>
      <FieldValueMeta>
        {suggestedMaxFeeCurrencyValue !== undefined ? (
          <FeeEstimationValue>
            Max ~{prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)}
          </FeeEstimationValue>
        ) : (
          <TextWithAmount amount={totalMaxFee}>
            <FeeEstimationValue>
              Max ~
              {feeToken ? (
                prettifyTokenAmount({
                  amount: totalMaxFee,
                  decimals: feeToken.decimals,
                  symbol: feeToken.symbol,
                })
              ) : (
                <>{totalMaxFee} Unknown</>
              )}
            </FeeEstimationValue>
          </TextWithAmount>
        )}
      </FieldValueMeta>
    </FieldValueGroup>
  )
}

export { TokenAmounts }
