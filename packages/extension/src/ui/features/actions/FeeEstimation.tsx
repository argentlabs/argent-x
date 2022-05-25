import Tippy from "@tippyjs/react"
import { BigNumber, utils } from "ethers"
import { FC, Suspense, useEffect, useMemo, useState } from "react"
import { Call } from "starknet"
import styled, { keyframes } from "styled-components"
import useSWR from "swr"

import { Tooltip } from "../../components/CopyTooltip"
import {
  InfoRoundedIcon,
  ReportGmailerrorredRoundedIcon,
} from "../../components/Icons/MuiIcons"
import { getEstimatedFee } from "../../services/messaging"
import { useAccount } from "../accounts/accounts.state"
import { fetchFeeTokenBalance } from "../accountTokens/tokens.service"

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

  svg {
    max-height: 16px;
    max-width: 16px;
    margin-left: 6px;
    cursor: pointer;
  }
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
  onChange?: (fee: BigNumber, error?: unknown) => void
  accountAddress: string
  networkId: string
}

const useMaxFeeEstimation = (props: FeeEstimationProps) => {
  const defaultData = {
    unit: "wei",
    amount: BigNumber.from(0),
    suggestedMaxFee: BigNumber.from(0),
    error: undefined,
  }

  const { data = defaultData } = useSWR(
    ["transactions" in props ? props.transactions : { maxFee: props.maxFee }],
    async (x) => {
      if ("maxFee" in x) {
        return { unit: "wei", amount: x.maxFee, suggestedMaxFee: x.maxFee }
      }
      try {
        return await getEstimatedFee(x)
      } catch (error) {
        return { error, suggestedMaxFee: BigNumber.from(-1) }
      }
    },
    {
      suspense: true,
      refreshInterval: 20 * 1000, // 20 seconds
    },
  )
  // use suggestedMaxFee as amount value as we dont support showing actual fee vs max fee yet.
  return {
    amount: data.suggestedMaxFee,
    error: data.error,
  }
}

const FeeEstimationInput: FC<FeeEstimationProps> = ({ onChange, ...props }) => {
  const { amount, error } = useMaxFeeEstimation(props)

  useEffect(() => {
    if ("transactions" in props) {
      onChange?.(amount, error)
    }
  }, [])

  const [fee, setFee] = useState(amount)
  const [isFocused, setIsFocused] = useState(false)
  const [feeInput, setFeeInput] = useState(utils.formatEther(amount))

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
            : amount
          setFeeInput(utils.formatEther(value) ?? utils.formatEther(amount))
          setFee(value)
          onChange?.(value, error)
        } catch {
          setFeeInput(utils.formatEther(amount))
          setFee(amount)
          onChange?.(amount, error)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
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
  const account = useAccount(props.accountAddress)
  if (!account) {
    throw new Error("Account not found")
  }

  const [fee, setFee] = useState<BigNumber>()
  const [estimationFailed, setEstimationFailed] = useState(false)

  const { data: feeTokenBalance } = useSWR(
    [account, props.networkId],
    fetchFeeTokenBalance,
    { suspense: false },
  )

  const firstFetchDone = Boolean(fee?.gt(0))
  const enoughBalance = useMemo(
    () => Boolean(fee && feeTokenBalance?.gte(fee)),
    [fee, feeTokenBalance],
  )

  // this is just possible as long as starknet accepts 0 fee transactions
  useEffect(() => {
    if (firstFetchDone && !enoughBalance) {
      onChange?.(BigNumber.from("0"))
    }
  }, [firstFetchDone, enoughBalance])

  const tooltip = estimationTooltip(
    firstFetchDone,
    enoughBalance,
    estimationFailed,
  )

  return (
    <FeeEstimationWrapper>
      <span>
        <FeeEstimationText>
          Network fee
          <Tippy content={<Tooltip as="div">{tooltip}</Tooltip>}>
            {firstFetchDone && enoughBalance && !estimationFailed ? (
              <InfoRoundedIcon style={{ color: "white" }} />
            ) : (
              <ReportGmailerrorredRoundedIcon style={{ color: "red" }} />
            )}
          </Tippy>
        </FeeEstimationText>
      </span>
      {estimationFailed ? (
        <span>failed</span>
      ) : (
        <Center>
          <Suspense fallback={<LoadingInput />}>
            <FeeEstimationInput
              {...props}
              onChange={(fee, error) => {
                setFee(fee)
                setEstimationFailed(!!error)
                onChange?.(fee)
              }}
            />
          </Suspense>
          <FeeEstimationValue>ETH</FeeEstimationValue>
        </Center>
      )}
    </FeeEstimationWrapper>
  )
}

const estimationTooltip = (
  firstFetchDone: boolean,
  enoughBalance: boolean,
  estimationFailed: boolean,
) => {
  if (estimationFailed) {
    return "Cannot estimate network fee, this means that the transaction will likely fail because it's invalid"
  }
  if (firstFetchDone) {
    return enoughBalance
      ? "Network fees are paid to the network to include transactions in blocks"
      : "Insufficient balance to pay network fees. We'll try to include your transaction without a fee as long as possible"
  }
  return "Network fee is still loading. We'll try to include your transaction without a fee as long as possible"
}
