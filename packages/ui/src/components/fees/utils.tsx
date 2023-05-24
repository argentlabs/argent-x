import { TokenWithBalance, prettifyTokenAmount } from "@argent/shared"
import { Flex, useColorMode } from "@chakra-ui/react"
import { formatEther, toBigInt } from "ethers"
import { useMemo } from "react"

import { L1, P4 } from "../Typography"

interface MakeClickableOptions {
  label?: string
  tabIndex?: number
}

export const makeClickable = (
  handler?: () => void,
  { label, tabIndex = 0 }: MakeClickableOptions = {},
) => ({
  tabIndex,
  role: "button",
  ...(label ? { "aria-label": label } : {}),
  onClick: handler,
  onKeyUp: (e: any) => {
    if (e.keyCode === 13) {
      handler?.()
    }
  },
})

export const getParsedError = (errorTxt: string) => {
  try {
    const regex = new RegExp("Error in the called contract", "g")
    const matchAll = [...errorTxt.matchAll(regex)]
    return errorTxt.slice(matchAll[1].index).toString()
  } catch {
    return errorTxt.toString()
  }
}

export function getTooltipTextBase(maxFee?: bigint, feeTokenBalance?: bigint) {
  if (!maxFee || !feeTokenBalance) {
    return "Network fee is still loading."
  }
  if (feeTokenBalance > maxFee) {
    return "Network fees are paid to the network to include transactions in blocks"
  }
  return `Insufficient balance to pay network fees. You need at least ${formatEther(
    toBigInt(maxFee) - feeTokenBalance,
  )} ETH more.`
}

interface FeeEstimationTooltipProps {
  feeToken: TokenWithBalance
  maxNetworkFee?: bigint
  maxAccountDeploymentFee?: bigint
  totalMaxFee?: bigint
}

export const TooltipTextCombined = ({
  feeToken,
  maxAccountDeploymentFee,
  maxNetworkFee,
  totalMaxFee,
}: FeeEstimationTooltipProps): JSX.Element => {
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])

  if (!maxNetworkFee || !maxAccountDeploymentFee || !totalMaxFee || !feeToken) {
    return (
      <P4 color={isDark ? "neutrals.100" : "black"}>
        Network fee is still loading.
      </P4>
    )
  }
  if (feeToken.balance > totalMaxFee) {
    return (
      <Flex flexDirection="column" gap="3">
        <P4 color={isDark ? "neutrals.100" : "black"}>
          Network fees are paid to the network to include transactions in blocks
        </P4>

        <Flex flexDirection="column" gap="1">
          <Flex justifyContent="space-between">
            <L1 color={isDark ? "white" : "black"}>Starknet Network</L1>
            <L1 color={isDark ? "white" : "black"}>
              ≈{" "}
              {prettifyTokenAmount({
                amount: maxNetworkFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })}
            </L1>
          </Flex>
          <Flex justifyContent="space-between">
            <L1 color={isDark ? "white" : "black"}>One-time activation fee</L1>
            <L1 color={isDark ? "white" : "black"}>
              ≈{" "}
              {prettifyTokenAmount({
                amount: maxAccountDeploymentFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })}
            </L1>
          </Flex>
        </Flex>
      </Flex>
    )
  }
  return (
    <P4 color={isDark ? "neutrals.500" : "black"}>
      Insufficient balance to pay network fees. You need at least
      {formatEther(toBigInt(totalMaxFee) - toBigInt(feeToken.balance))} ETH
      more.
    </P4>
  )
}
