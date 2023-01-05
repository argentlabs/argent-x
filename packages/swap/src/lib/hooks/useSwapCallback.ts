import { useMemo } from "react"
import { Call, RawArgs, stark, uint256 } from "starknet"

import {
  JSBI,
  Percent,
  Router,
  SwapParameters,
  Trade,
  TradeType,
} from "../../sdk"
import { ROUTER_ADDRESS } from "../../sdk/constants"
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from "../constants"
import { useSwapProvider } from "../providers"
// import useENS from './useENS'
import { useApprovalCallFromTrade } from "./useApproveCall"
import useTransactionDeadline from "./useTransactionDeadline"

// import useTransactionDeadline from "./useTransactionDeadline"

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  routerAddress: string
  parameters: SwapParameters
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): SwapCall[] {
  const { selectedAccount, networkId } = useSwapProvider()

  const recipient = selectedAccount?.address

  const deadline = useTransactionDeadline()

  const routerAddress = networkId && ROUTER_ADDRESS[networkId]

  return useMemo(() => {
    if (!trade || !recipient || !deadline || !routerAddress) {
      return []
    }

    const swapMethods: any[] = []

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        deadline: deadline.toNumber(),
      }),
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          deadline: deadline.toNumber(),
        }),
      )
    }
    return swapMethods.map((parameters) => ({
      routerAddress,
      parameters,
    }))
  }, [allowedSlippage, deadline, recipient, routerAddress, trade])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): {
  state: SwapCallbackState
  callback: null | (() => Call[])
  error: string | null
} {
  const { selectedAccount } = useSwapProvider()

  const approvalCallback = useApprovalCallFromTrade(trade, allowedSlippage)
  const swapCalls = useSwapCallArguments(trade, allowedSlippage)

  const recipient = selectedAccount?.address

  return useMemo(() => {
    if (!trade || !selectedAccount) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      }
    }
    if (!recipient) {
      return { state: SwapCallbackState.LOADING, callback: null, error: null }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: function onSwap(): Call[] {
        const approval = approvalCallback()

        if (!approval) {
          throw new Error("Unexpected Approval Call error")
        }

        const {
          routerAddress,
          parameters: { methodName, args },
        } = swapCalls[0]

        const [amountIn, amountOut, path, to, deadline] = args

        const uint256AmountIn = uint256.bnToUint256(amountIn as string)
        const uint256AmountOut = uint256.bnToUint256(amountOut as string)

        const swapArgs: RawArgs = {
          amountIn: { type: "struct", ...uint256AmountIn },
          amountOutMin: { type: "struct", ...uint256AmountOut },
          path,
          to,
          deadline,
        }

        const swapCalldata = stark.compileCalldata(swapArgs)

        const swapCall: Call = {
          contractAddress: routerAddress,
          entrypoint: methodName,
          calldata: swapCalldata,
        }

        return [approval, swapCall]
      },
      error: null,
    }
  }, [trade, selectedAccount, recipient, swapCalls, approvalCallback])
}
