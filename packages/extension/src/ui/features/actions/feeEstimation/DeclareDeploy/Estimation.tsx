import { Collapse } from "@mui/material"
import { FC, useEffect, useMemo, useState } from "react"

import { CopyTooltip } from "../../../../components/CopyTooltip"
import { Field, FieldError, FieldGroup } from "../../../../components/Fields"
import { KeyboardArrowDownRounded } from "../../../../components/Icons/MuiIcons"
import { makeClickable } from "../../../../services/a11y"
import {
  DetailsText,
  ExtendableControl,
  FeeErrorContainer,
  FeeEstimationValue,
  LoadingInput,
} from "../styled"
import { getParsedError } from "../utils"
import { NetworkFee } from "./NetworkFee"
import { TokenAmounts } from "./TokenAmounts"

const Estimation: FC<any> = ({
  fee,
  feeToken,
  feeTokenBalance,
  error,
  onErrorChange,
}) => {
  const [feeEstimateExpanded, setFeeEstimateExpanded] = useState(false)

  const enoughBalance = useMemo(
    () => Boolean(fee && feeTokenBalance?.gte(fee?.maxADFee)),
    [fee, feeTokenBalance],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError

  const parsedFeeEstimationError = showEstimateError && getParsedError(error)

  useEffect(() => {
    onErrorChange?.(hasError)
    // only rerun when error changes
  }, [hasError])

  return (
    <FieldGroup error={showError}>
      <Field>
        <NetworkFee
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
      {showFeeError && <FieldError>Not enough funds to cover fee</FieldError>}
      {showEstimateError && (
        <>
          <FieldError justify="space-between">
            Transaction failure predicted
            <ExtendableControl
              {...makeClickable(() => setFeeEstimateExpanded((x) => !x), {
                label: "Show error details",
              })}
            >
              <DetailsText>Details</DetailsText>
              <KeyboardArrowDownRounded
                style={{
                  transition: "transform 0.2s ease-in-out",
                  transform: feeEstimateExpanded
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                  height: 13,
                  width: 13,
                }}
              />
            </ExtendableControl>
          </FieldError>

          <Collapse
            in={feeEstimateExpanded}
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
