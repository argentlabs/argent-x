import { Collapse } from "@mui/material"
import Tippy from "@tippyjs/react"
import { BigNumber, utils } from "ethers"
import { FC, useEffect, useMemo, useState } from "react"
import { Call } from "starknet"
import styled, { css, keyframes } from "styled-components"
import { DefaultTheme } from "styled-components"
import useSWR from "swr"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { getFeeToken } from "../../../shared/token/utils"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { CopyTooltip, Tooltip } from "../../components/CopyTooltip"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldKey,
  FieldKeyGroup,
  FieldValue,
  FieldValueGroup,
  FieldValueMeta,
} from "../../components/Fields"
import { KeyboardArrowDownRounded } from "../../components/Icons/MuiIcons"
import {
  InfoRoundedIcon,
  ReportGmailerrorredRoundedIcon,
} from "../../components/Icons/MuiIcons"
import { makeClickable } from "../../services/a11y"
import { getEstimatedFee } from "../../services/backgroundTransactions"
import { useAccount } from "../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../accountTokens/tokenPriceHooks"
import { fetchFeeTokenBalance } from "../accountTokens/tokens.service"

const FeeEstimationValue = styled.p`
  display: inline-block;
  margin-inline-start: 0.3em;
  &:not(:last-child) {
    margin-inline-end: 0.3em;
  }
`

const ExtendableControl = styled.div`
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  gap: 4px;
`

const DetailsText = styled.span`
  opacity: 0.5;
  color: ${({ theme }) => theme.text1};
`

const pulseKeyframe = ({ theme }: { theme: DefaultTheme }) => keyframes`
  0% {
    background-color: ${theme.bg4};
    background: linear-gradient(to right, ${theme.bg4} 0% ${theme.text2} 50%, ${theme.bg4} 100%);
  }
  100% {
    background-color: ${theme.bg4};
    background: linear-gradient(to right,${theme.text2} 0% ${theme.bg4} 50%, ${theme.text2} 100%);
  }
`

const LoadingInput = styled.div`
  width: 77px;
  height: 20px;
  border-radius: 2px;
  background: ${({ theme }) => theme.text2};
  animation: ${pulseKeyframe} 1s alternate infinite;
`

const FeeErrorContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 8px;
  padding: 16px 20px;
  overflow: auto;
  cursor: pointer;
`

function displayEther(value: BigNumber) {
  const formattedValue = utils.formatEther(value)
  const [int, dec] = formattedValue.split(".")
  const shortenedValue = `${int}.${dec.slice(0, 5)}`
  return shortenedValue === formattedValue
    ? formattedValue
    : `~${shortenedValue}`
}

interface FeeEstimationProps {
  transactions: Call | Call[]
  defaultMaxFee?: BigNumber
  onChange?: (fee: BigNumber) => void
  onErrorChange?: (error: boolean) => void
  accountAddress: string
  networkId: string
  actionHash: string
}

export const useMaxFeeEstimation = (
  transactions: Call | Call[],
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [actionHash, "feeEstimation"],
    () => getEstimatedFee(transactions),
    {
      suspense: false,
      refreshInterval: 20 * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error }
}

function getTooltipText(
  suggestedMaxFee?: BigNumber,
  feeTokenBalance?: BigNumber,
) {
  if (!suggestedMaxFee || !feeTokenBalance) {
    return "Network fee is still loading."
  }
  if (feeTokenBalance.gte(suggestedMaxFee)) {
    return "Network fees are paid to the network to include transactions in blocks"
  }
  return `Insufficient balance to pay network fees. You need at least ${utils.formatEther(
    suggestedMaxFee.sub(feeTokenBalance),
  )} ETH more.`
}

const StyledIconMixin = css`
  max-height: 16px;
  max-width: 16px;
  margin-left: 6px;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
`
const StyledInfoRoundedIcon = styled(InfoRoundedIcon)`
  ${StyledIconMixin}
`
const StyledReportGmailerrorredRoundedIcon = styled(
  ReportGmailerrorredRoundedIcon,
)`
  ${StyledIconMixin}
`

export const FeeEstimation: FC<FeeEstimationProps> = ({
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

  const enoughBalance = useMemo(
    () => Boolean(fee && feeTokenBalance?.gte(fee.suggestedMaxFee)),
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
    fee?.amount,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.suggestedMaxFee,
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
                  {prettifyCurrencyValue(amountCurrencyValue)}
                </FeeEstimationValue>
              ) : (
                <FeeEstimationValue>
                  {displayEther(fee.amount)} ETH
                </FeeEstimationValue>
              )}
            </FieldValue>
            <FieldValueMeta>
              {suggestedMaxFeeCurrencyValue !== undefined ? (
                <FeeEstimationValue>
                  Max {prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)}
                </FeeEstimationValue>
              ) : (
                <FeeEstimationValue>
                  Max {displayEther(fee.suggestedMaxFee)} ETH
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

const getParsedError = (errorTxt: string) => {
  try {
    const regex = new RegExp("Error in the called contract", "g")
    const matchAll = [...errorTxt.matchAll(regex)]
    return errorTxt.slice(matchAll[1].index)
  } catch {
    return errorTxt
  }
}
