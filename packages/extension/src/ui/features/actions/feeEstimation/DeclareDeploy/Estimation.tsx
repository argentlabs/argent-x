import { Collapse } from "@mui/material"
import { FC, useEffect, useMemo, useState } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../../shared/token/price"
import { CopyTooltip } from "../../../../components/CopyTooltip"
import {
  Field,
  FieldAlt,
  FieldError,
  FieldGroup,
  FieldKeyGroup,
  FieldKeySub,
  FieldValueGroup,
  FieldValueSub,
} from "../../../../components/Fields"
import { KeyboardArrowDownRounded } from "../../../../components/Icons/MuiIcons"
import { makeClickable } from "../../../../services/a11y"
import { useTokenAmountToCurrencyValue } from "../../../accountTokens/tokenPriceHooks"
import {
  DetailsText,
  ExtendableControl,
  FeeErrorContainer,
  FeeEstimationValue,
  LoadingInput,
  Separator,
} from "../styled"
import { getParsedError } from "../utils"
import { NetworkFee } from "./NetworkFee"
import { TokenAmounts } from "./TokenAmounts"

const Estimation: FC<any> = ({
  needsDeploy,
  fee,
  feeToken,
  feeTokenBalance,
  error,
  onErrorChange,
}) => {
  const [feeEstimateExpanded, setFeeEstimateExpanded] = useState(false)
  const [feeEstimateExpandedError, setFeeEstimateErrorExpanded] =
    useState(false)

  const enoughBalance = useMemo(
    () => Boolean(fee && feeTokenBalance?.gte(fee?.suggestedMaxFee)),
    [fee, feeTokenBalance],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError

  const parsedFeeEstimationError = showEstimateError && getParsedError(error)

  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )

  const accountDeploymentCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.accountDeploymentFee,
  )

  useEffect(() => {
    onErrorChange?.(hasError)
    // only rerun when error changes
  }, [hasError, onErrorChange])

  return (
    <FieldGroup error={showError}>
      <Field
        {...makeClickable(() => setFeeEstimateExpanded((x) => !x), {
          label: "Show Fee Estimate details",
        })}
        style={{ cursor: "pointer", paddingRight: "5px" }}
      >
        <NetworkFee
          needsDeploy={needsDeploy}
          fee={fee}
          feeTokenBalance={feeTokenBalance}
          enoughBalance={enoughBalance}
        />
        {fee ? (
          <TokenAmounts feeToken={feeToken} fee={fee} />
        ) : showEstimateError ? (
          <FeeEstimationValue>Error</FeeEstimationValue>
        ) : (
          <LoadingInput />
        )}
      </Field>

      <Collapse in={feeEstimateExpanded}>
        <Separator />

        <FieldAlt>
          <FieldKeyGroup>
            <FieldKeySub>Transaction fee</FieldKeySub>
            <FieldKeySub>One-time activation fee</FieldKeySub>
          </FieldKeyGroup>
          {fee && fee.accountDeploymentFee && fee.maxADFee && (
            <FieldValueGroup>
              <FieldValueSub>
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
              </FieldValueSub>
              <FieldValueSub>
                {accountDeploymentCurrencyValue !== undefined ? (
                  <FeeEstimationValue>
                    ~{prettifyCurrencyValue(accountDeploymentCurrencyValue)}
                  </FeeEstimationValue>
                ) : (
                  <FeeEstimationValue>
                    ~
                    {feeToken ? (
                      prettifyTokenAmount({
                        amount: fee.accountDeploymentFee,
                        decimals: feeToken.decimals,
                        symbol: feeToken.symbol,
                      })
                    ) : (
                      <>{fee.accountDeploymentFee} Unknown</>
                    )}
                  </FeeEstimationValue>
                )}
              </FieldValueSub>
            </FieldValueGroup>
          )}
        </FieldAlt>
      </Collapse>

      {showFeeError && <FieldError>Not enough funds to cover fee</FieldError>}
      {showEstimateError && (
        <>
          <FieldError justify="space-between">
            Transaction failure predicted
            <ExtendableControl
              {...makeClickable(() => setFeeEstimateErrorExpanded((x) => !x), {
                label: "Show error details",
              })}
            >
              <DetailsText>Details</DetailsText>
              <KeyboardArrowDownRounded
                style={{
                  transition: "transform 0.2s ease-in-out",
                  transform: feeEstimateExpandedError
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                  height: 13,
                  width: 13,
                }}
              />
            </ExtendableControl>
          </FieldError>

          <Collapse
            in={feeEstimateExpandedError}
            timeout="auto"
            style={{
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            {parsedFeeEstimationError && (
              <CopyTooltip
                copyValue={parsedFeeEstimationError}
                message="Copied"
              >
                <FeeErrorContainer>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {parsedFeeEstimationError}
                  </pre>
                </FeeErrorContainer>
              </CopyTooltip>
            )}
          </Collapse>
        </>
      )}
    </FieldGroup>
  )
}

export { Estimation }
