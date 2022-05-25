import Tippy from "@tippyjs/react"
import { BigNumber, utils } from "ethers"
import { FC, useEffect, useMemo } from "react"
import { Call } from "starknet"
import styled, { keyframes } from "styled-components"
import useSWR from "swr"

import { Tooltip } from "../../components/CopyTooltip"
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
import {
  InfoRoundedIcon,
  ReportGmailerrorredRoundedIcon,
} from "../../components/Icons/MuiIcons"
import { getEstimatedFee } from "../../services/messaging"
import { useAccount } from "../accounts/accounts.state"
import { fetchFeeTokenBalance } from "../accountTokens/tokens.service"

const FeeEstimationValue = styled.p`
  * + & {
    margin-left: 0.3em;
  }
`

const InvisibleInput = styled.span`
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  width: fit-content;
  text-align: right;
  &:disabled {
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
  }
`

const pulseKeyframe = keyframes`
  0% {
    background-color: #8f8e8c;
    background: linear-gradient(to right,#5f5e5c 0% #8f8e8c 50%, #5f5e5c 100%);
  }
  100% {
    background-color: #5f5e5c;
    background: linear-gradient(to right,#8f8e8c 0% #5f5e5c 50%, #8f8e8c 100%);
  }
`

const LoadingInput = styled.div`
  width: 77px;
  height: 20px;
  border-radius: 2px;
  background: #8f8e8c;
  animation: ${pulseKeyframe} 1s alternate infinite;
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
}

export const useMaxFeeEstimation = (transactions: Call | Call[]) => {
  const { data: fee, error } = useSWR(
    [transactions, "feeEstimation"],
    getEstimatedFee,
    {
      suspense: false,
      refreshInterval: 20 * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )

  return { fee, error }
}

export const FeeEstimation: FC<FeeEstimationProps> = ({
  onChange,
  accountAddress,
  transactions,
  onErrorChange,
  ...props
}) => {
  const account = useAccount(accountAddress)
  if (!account) {
    throw new Error("Account not found")
  }

  const { data: feeTokenBalance } = useSWR(
    [account, props.networkId],
    fetchFeeTokenBalance,
    { suspense: false },
  )

  const { fee, error } = useMaxFeeEstimation(transactions)

  const enoughBalance = useMemo(
    () => Boolean(fee && feeTokenBalance?.gte(fee.suggestedMaxFee)),
    [fee, feeTokenBalance],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  useEffect(() => {
    onErrorChange?.(!fee || !feeTokenBalance || !enoughBalance || showError)
  }, [onErrorChange, showError, fee, feeTokenBalance, enoughBalance])

  return (
    <FieldGroup error={showError}>
      <Field>
        <FieldKeyGroup>
          <FieldKey>
            Network fee
            <Tippy
              content={
                <Tooltip as="div">
                  {fee && feeTokenBalance
                    ? enoughBalance
                      ? "Network fees are paid to the network to include transactions in blocks"
                      : `Insufficient balance to pay network fees. You need at least ${utils.formatEther(
                          fee.suggestedMaxFee,
                        )} ETH and your current balance is ${utils.formatEther(
                          feeTokenBalance,
                        )} ETH.`
                    : "Network fee is still loading."}
                </Tooltip>
              }
            >
              {enoughBalance ? (
                <InfoRoundedIcon
                  style={{
                    maxHeight: "16px",
                    maxWidth: "16px",
                    marginLeft: "6px",
                    color: "#8f8e8c",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <ReportGmailerrorredRoundedIcon
                  style={{
                    maxHeight: "16px",
                    maxWidth: "16px",
                    marginLeft: "6px",
                    color: "#8f8e8c",
                    cursor: "pointer",
                  }}
                />
              )}
            </Tippy>
          </FieldKey>
        </FieldKeyGroup>
        {fee ? (
          <FieldValueGroup>
            <FieldValue>
              {fee.usd?.amount && <FeeEstimationValue>$</FeeEstimationValue>}
              <InvisibleInput
                role="textbox"
                contentEditable={false} // disable editing for now
              >
                {fee.usd?.amount ?? displayEther(fee.amount)}
              </InvisibleInput>
              {!fee.usd?.amount && <FeeEstimationValue>ETH</FeeEstimationValue>}
            </FieldValue>
            <FieldValueMeta>
              <FeeEstimationValue style={{ marginRight: "0.2em" }}>
                Max
              </FeeEstimationValue>
              {fee.usd?.suggestedMaxFee && (
                <FeeEstimationValue>$</FeeEstimationValue>
              )}
              <InvisibleInput
                role="textbox"
                contentEditable={false} // disable editing for now
              >
                {fee.usd?.suggestedMaxFee ?? displayEther(fee.suggestedMaxFee)}
              </InvisibleInput>
              {!fee.usd?.suggestedMaxFee && (
                <FeeEstimationValue>ETH</FeeEstimationValue>
              )}
            </FieldValueMeta>
          </FieldValueGroup>
        ) : showEstimateError ? (
          <InvisibleInput>Unknown</InvisibleInput>
        ) : (
          <LoadingInput />
        )}
      </Field>
      {showFeeError && <FieldError>Not enough funds to cover fee</FieldError>}
      {showEstimateError && (
        <FieldError>Transaction failure predicted</FieldError>
      )}
    </FieldGroup>
  )
}
