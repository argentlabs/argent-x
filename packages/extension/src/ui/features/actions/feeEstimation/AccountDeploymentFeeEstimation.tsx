import { Collapse } from "@mui/material"
import Tippy from "@tippyjs/react"
import { FC, useEffect, useMemo, useState } from "react"
import useSWR from "swr"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { getFeeToken } from "../../../../shared/token/utils"
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
import {
  DetailsText,
  ExtendableControl,
  FeeErrorContainer,
  FeeEstimationValue,
  LoadingInput,
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "./styled"
import { DeployAccountFeeEstimationProps } from "./types"
import { getTooltipText, useMaxAccountDeploymentFeeEstimation } from "./utils"
import { getParsedError } from "./utils"

export const AccountDeploymentFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({ accountAddress, actionHash, onErrorChange, networkId }) => {
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

  const { fee, error } = useMaxAccountDeploymentFeeEstimation(
    account,
    actionHash,
  )

  const enoughBalance = useMemo(
    () => Boolean(fee && feeTokenBalance?.gte(fee?.maxADFee)),
    [fee, feeTokenBalance],
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
    fee?.accountDeploymentFee,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.maxADFee,
  )

  return (
    <FieldGroup error={showError}>
      <Field>
        <FieldKeyGroup>
          <FieldKey>
            Network fee
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
