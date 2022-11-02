import { Collapse } from "@mui/material"
import Tippy from "@tippyjs/react"
import { FC, useEffect, useMemo, useState } from "react"
import { number } from "starknet"
import useSWR from "swr"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { CopyTooltip, Tooltip } from "../../../components/CopyTooltip"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldKey,
  FieldKeyGroup,
  FieldValue,
  FieldValueGroup,
  FieldValueMeta,
} from "../../../components/Fields"
import { KeyboardArrowDownRounded } from "../../../components/Icons/MuiIcons"
import { makeClickable } from "../../../services/a11y"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { fetchFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import {
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
import { getTooltipText, useMaxFeeEstimation } from "./utils"
import { getParsedError } from "./utils"

export const FeeEstimation: FC<TransactionsFeeEstimationProps> = ({
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

  const { data: feeTokenBalance } = useSWR(
    [getAccountIdentifier(account), account.networkId, "feeTokenBalance"],
    () => fetchFeeTokenBalance(account, account.networkId),
    { suspense: false },
  )

  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  const totalMaxFee = useMemo(() => {
    if (account.needsDeploy && fee?.maxADFee) {
      return number.toHex(
        number.toBN(fee.maxADFee).add(number.toBN(fee.suggestedMaxFee)),
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
  const feeToken = useNetworkFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.suggestedMaxFee,
  )
  const accountDeploymentCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.accountDeploymentFee,
  )

  const maxADCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.maxADFee,
  )

  return (
    <FieldGroup error={showError}>
      {account.needsDeploy && (
        <Field>
          <FieldKeyGroup>
            <FieldKey>
              Activation fee
              <Tippy
                content={
                  <Tooltip as="div">
                    {getTooltipText(fee?.maxADFee, feeTokenBalance)}
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
          </FieldKeyGroup>
          {fee && fee.accountDeploymentFee && fee.maxADFee ? (
            <FieldValueGroup>
              <FieldValue>
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
              </FieldValue>
              <FieldValueMeta>
                {maxADCurrencyValue !== undefined ? (
                  <FeeEstimationValue>
                    Max ~{prettifyCurrencyValue(maxADCurrencyValue)}
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
          ) : showEstimateError ? (
            <FeeEstimationValue>Error</FeeEstimationValue>
          ) : (
            <LoadingInput />
          )}
        </Field>
      )}
      <Separator />
      <Field>
        <FieldKeyGroup>
          <FieldKey>
            Network fee
            <Tippy
              content={
                <Tooltip as="div">
                  {getTooltipText(fee?.suggestedMaxFee, feeTokenBalance)}
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
        </FieldKeyGroup>
        {fee ? (
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
                      amount: fee.suggestedMaxFee,
                      decimals: feeToken.decimals,
                      symbol: feeToken.symbol,
                    })
                  ) : (
                    <>{fee.suggestedMaxFee} Unknown</>
                  )}
                </FeeEstimationValue>
              )}
            </FieldValueMeta>
          </FieldValueGroup>
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

          <Collapse in={feeEstimateExpanded} timeout="auto">
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
