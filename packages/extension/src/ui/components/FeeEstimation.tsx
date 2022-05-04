import Tippy from "@tippyjs/react"
import { BigNumber, utils } from "ethers"
import { FC, Suspense, useEffect, useMemo, useState } from "react"
import type { Call } from "starknet"
import styled, { keyframes } from "styled-components"
import useSWR from "swr"

import { getEstimatedFee } from "../utils/messaging"
import { fetchFeeTokenBalance } from "../utils/tokens"
import { Tooltip } from "./CopyTooltip"
import { DangerIcon, InfoIcon } from "./Icons/MuiIcons"

const Center = styled.div`
  display: flex;
  align-items: center;
`

const FeeEstimationWrapper = styled(Center)`
  justify-content: space-between;
  margin-top: 16px;
  padding: 20px;
  border-radius: 8px;
  background: #333332;
`

const FeeEstimationText = styled.p`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: #8f8e8c;
`

const FeeEstimationValue = styled.p`
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: #ffffff;

  * + & {
    margin-left: 0.3em;
  }
`

const InvisibleInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: #ffffff;
  max-width: 80px;
  text-align: right;
`

type FeeEstimationProps = (
  | {
      maxFee: BigNumber
    }
  | {
      transactions: Call | Call[]
    }
) & {
  onChange: (fee: BigNumber) => void
  accountAddress: string
  networkId: string
}

const FeeEstimationInput: FC<FeeEstimationProps> = ({ onChange, ...props }) => {
  const { data: { amount } = { unit: "wei", amount: 0 } } = useSWR(
    [
      "transactions" in props
        ? props.transactions
        : { maxFee: props.maxFee.toNumber() },
    ],
    async (x) => {
      if ("maxFee" in x) {
        return { unit: "wei", amount: x.maxFee }
      }
      return getEstimatedFee(x)
    },
    {
      suspense: true,
      refreshInterval: 20 * 1000, // 20 seconds
    },
  )

  useEffect(() => {
    if ("transactions" in props) {
      onChange(BigNumber.from(amount))
    }
  }, [])

  const maxFee = BigNumber.from(amount)
  const [fee, setFee] = useState(maxFee)
  const [isFocused, setIsFocused] = useState(false)
  const [feeInput, setFeeInput] = useState(utils.formatEther(maxFee))
  return (
    <InvisibleInput
      value={isFocused ? feeInput : utils.formatEther(fee)}
      onFocus={(e) => {
        setIsFocused(true)
        setTimeout(() => {
          e.target.select()
        }, 50)
      }}
      onChange={(e) => {
        setFeeInput(e.target.value)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        try {
          const value = e.currentTarget.value
            ? utils.parseEther(e.currentTarget.value)
            : maxFee
          setFeeInput(utils.formatEther(value) ?? utils.formatEther(maxFee))
          setFee(value)
          onChange(value)
        } catch {
          setFeeInput(utils.formatEther(maxFee))
          setFee(maxFee)
          onChange(maxFee)
        }
      }}
      // on enter blur
      onKeyDown={(e) => {
        if (e.keyCode === 13) {
          e.currentTarget.blur()
        }
      }}
    />
  )
}

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

export const FeeEstimation: FC<FeeEstimationProps> = ({
  onChange,
  ...props
}) => {
  const [fee, setFee] = useState<BigNumber>()

  const { data: feeTokenBalance } = useSWR(
    [props.accountAddress, props.networkId],
    fetchFeeTokenBalance,
    { suspense: false },
  )

  const firstFetchDone = Boolean(fee)
  const enoughBalance = useMemo(
    () => Boolean(fee && feeTokenBalance?.gte(fee)),
    [fee, feeTokenBalance],
  )

  // this is just possible as long as starknet accepts 0 fee transactions
  useEffect(() => {
    if (firstFetchDone && !enoughBalance) {
      onChange(BigNumber.from("0"))
    }
  }, [firstFetchDone, enoughBalance])

  return (
    <FeeEstimationWrapper>
      <span>
        <FeeEstimationText>
          Network fee
          <Tippy
            content={
              <Tooltip as="div">
                {firstFetchDone
                  ? enoughBalance
                    ? "Network fees are paid to the network to include transactions in blocks"
                    : "Insufficient balance to pay network fees. We'll try to include your transaction without a fee as long as possible"
                  : "Network fee is still loading. We'll try to include your transaction without a fee as long as possible"}
              </Tooltip>
            }
          >
            {firstFetchDone && enoughBalance ? (
              <InfoIcon
                style={{
                  maxHeight: "16px",
                  maxWidth: "16px",
                  marginLeft: "6px",
                  color: "white",
                  cursor: "pointer",
                }}
              />
            ) : (
              <DangerIcon
                style={{
                  maxHeight: "16px",
                  maxWidth: "16px",
                  marginLeft: "6px",
                  color: "red",
                  cursor: "pointer",
                }}
              />
            )}
          </Tippy>
        </FeeEstimationText>
      </span>
      <Center>
        <Suspense fallback={<LoadingInput />}>
          <FeeEstimationInput
            {...props}
            onChange={(fee) => {
              setFee(fee)
              onChange(fee)
            }}
          />
        </Suspense>
        <FeeEstimationValue>ETH</FeeEstimationValue>
      </Center>
    </FeeEstimationWrapper>
  )
}
