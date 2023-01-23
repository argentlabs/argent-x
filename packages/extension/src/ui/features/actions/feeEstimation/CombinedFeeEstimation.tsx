import { Collapse } from "@mui/material"
import Tippy from "@tippyjs/react"
import { FC, useEffect, useMemo, useState } from "react"
import { number } from "starknet"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { getFeeToken } from "../../../../shared/token/utils"
import { CopyTooltip, Tooltip } from "../../../components/CopyTooltip"
import {
  FieldAlt,
  FieldError,
  FieldGroup,
  FieldKey,
  FieldKeyGroup,
  FieldKeySub,
  FieldValue,
  FieldValueGroup,
  FieldValueMeta,
  FieldValueSub,
} from "../../../components/Fields"
import { KeyboardArrowDownRounded } from "../../../components/Icons/MuiIcons"
import Row from "../../../components/Row"
import { makeClickable } from "../../../services/a11y"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import {
  CaptionText,
  DetailsText,
  ExtendableControl,
  FeeErrorContainer,
  FeeEstimationValue,
  LoadingInput,
  Separator,
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "./styled"
import { TransactionsFeeEstimationProps } from "./types"
import { getParsedError, getTooltipText, useMaxFeeEstimation } from "./utils"

export const CombinedFeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  transactions,
  actionHash,
  onErrorChange,
  networkId,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const [feeEstimateExpanded, setFeeEstimateExpanded] = useState(false)
  const [feeErrorExpanded, setFeeErrorExpanded] = useState(false)

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  const totalFee = useMemo(() => {
    if (account.needsDeploy && fee?.accountDeploymentFee) {
      return number.toHex(
        number.toBigInt(fee.accountDeploymentFee) + number.toBigInt(fee.amount),
      )
    }
    return fee?.amount
  }, [account.needsDeploy, fee?.accountDeploymentFee, fee?.amount])

  const totalMaxFee = useMemo(() => {
    if (account.needsDeploy && fee?.maxADFee) {
      return number.toHex(
        number.toBigInt(fee.maxADFee) + number.toBigInt(fee.suggestedMaxFee),
      )
    }
    return fee?.suggestedMaxFee
  }, [account.needsDeploy, fee?.maxADFee, fee?.suggestedMaxFee])

  const enoughBalance = useMemo(
    () => Boolean(totalMaxFee && feeTokenBalance?.gte(totalMaxFee)),
    [feeTokenBalance, totalMaxFee],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
    // only rerun when error changes
  }, [hasError]) // eslint-disable-line react-hooks/exhaustive-deps

  const parsedFeeEstimationError = showEstimateError && getParsedError(error)
  const feeToken = getFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )

  const accountDeploymentCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.accountDeploymentFee,
  )

  const totalFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    totalFee,
  )

  const totalMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    totalMaxFee,
  )

  const hasTransactions = typeof transactions !== undefined

  if (!hasTransactions) {
    return <></>
  }

  return (
    <FieldGroup error={showError}>
      <FieldAlt
        {...makeClickable(() => setFeeEstimateExpanded((x) => !x), {
          label: "Show Fee Estimate details",
        })}
        style={{ cursor: "pointer", paddingRight: "5px" }}
      >
        <FieldKeyGroup>
          <FieldKey>
            Network fees
            <Tippy
              content={
                <Tooltip as="div">
                  {getTooltipText(totalMaxFee, feeTokenBalance)}
                </Tooltip>
              }
            >
              {enoughBalance ? (
                <StyledInfoRoundedIcon />
              ) : (
                <StyledReportGmailerrorredRoundedIcon />
              )}
            </Tippy>
          </FieldKey>
          <CaptionText>Includes one-time activation fee</CaptionText>
        </FieldKeyGroup>
        {totalFee && totalMaxFee ? (
          <Row style={{ width: "auto" }}>
            <FieldValueGroup>
              <FieldValue>
                {totalFeeCurrencyValue !== undefined ? (
                  <FeeEstimationValue>
                    {prettifyCurrencyValue(totalFeeCurrencyValue)}
                  </FeeEstimationValue>
                ) : (
                  <FeeEstimationValue>
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
                )}
              </FieldValue>
              <FieldValueMeta style={{ marginTop: "4px" }}>
                {totalMaxFeeCurrencyValue !== undefined ? (
                  <FeeEstimationValue>
                    Max {prettifyCurrencyValue(totalMaxFeeCurrencyValue)}
                  </FeeEstimationValue>
                ) : (
                  <FeeEstimationValue>
                    Max &nbsp;
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
                )}
              </FieldValueMeta>
            </FieldValueGroup>

            <KeyboardArrowDownRounded
              style={{
                transition: "transform 0.2s ease-in-out",
                transform: feeEstimateExpanded
                  ? "rotate(-180deg)"
                  : "rotate(0deg)",
                height: 24,
                width: 24,
              }}
            />
          </Row>
        ) : showEstimateError ? (
          <FeeEstimationValue>Error</FeeEstimationValue>
        ) : (
          <LoadingInput />
        )}
      </FieldAlt>

      <Collapse in={feeEstimateExpanded}>
        <Separator />

        <FieldAlt>
          <FieldKeyGroup>
            <FieldKeySub>Transaction fee</FieldKeySub>
            <FieldKeySub>One-time activation fee</FieldKeySub>
          </FieldKeyGroup>
          {fee && fee.accountDeploymentFee && fee.maxADFee ? (
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
          ) : showEstimateError ? (
            <FeeEstimationValue>Error</FeeEstimationValue>
          ) : (
            <LoadingInput />
          )}
        </FieldAlt>
      </Collapse>
      {showFeeError && <FieldError>Not enough funds to cover fee</FieldError>}
      {showEstimateError && (
        <>
          <FieldError justify="space-between">
            Transaction failure predicted
            <ExtendableControl
              {...makeClickable(() => setFeeErrorExpanded((x) => !x), {
                label: "Show error details",
              })}
            >
              <DetailsText>Details</DetailsText>
              <KeyboardArrowDownRounded
                style={{
                  transition: "transform 0.2s ease-in-out",
                  transform: feeErrorExpanded
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                  height: 13,
                  width: 13,
                }}
              />
            </ExtendableControl>
          </FieldError>

          <Collapse
            in={feeErrorExpanded}
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
