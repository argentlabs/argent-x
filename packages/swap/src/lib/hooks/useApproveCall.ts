import { useCallback, useMemo } from "react"
import { Call, CallData, RawArgs, uint256 } from "starknet"

import {
  CurrencyAmount,
  ETHER,
  Token,
  TokenAmount,
  Trade,
  WETH,
} from "../../sdk"
import { DEFAULT_NETWORK_ID, ROUTER_ADDRESS } from "../../sdk/constants"
import { useSwapProvider } from "../providers"
import { Field } from "../state"
import { computeSlippageAdjustedAmounts } from "../utils/prices"

export function useApprovalCall(
  amountToApprove?: CurrencyAmount,
  spender?: string,
): () => Call | null {
  const { networkId } = useSwapProvider()
  const token: Token | undefined =
    amountToApprove instanceof TokenAmount
      ? amountToApprove.token
      : amountToApprove?.currency === ETHER
      ? WETH[networkId ?? "goerli-alpha"]
      : undefined

  return useCallback(() => {
    if (!token) {
      console.error("no token")
      return null
    }

    if (!amountToApprove) {
      console.error("missing amount to approve")
      return null
    }

    if (!spender) {
      console.error("no spender")
      return null
    }

    const uint256AmountToApprove = uint256.bnToUint256(
      amountToApprove.raw.toString(),
    )

    const approveArgs: RawArgs = {
      spender,
      amount: uint256AmountToApprove,
    }

    const approveCalldata = CallData.compile(approveArgs)

    const approveCall: Call = {
      contractAddress: token.address,
      entrypoint: "approve",
      calldata: approveCalldata,
    }

    return approveCall
  }, [amountToApprove, spender, token])
}

export function useApprovalCallFromTrade(trade?: Trade, allowedSlippage = 0) {
  const { networkId } = useSwapProvider()

  const amountToApprove = useMemo(
    () =>
      trade
        ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT]
        : undefined,
    [trade, allowedSlippage],
  )

  const spender = ROUTER_ADDRESS[networkId ?? DEFAULT_NETWORK_ID]

  return useApprovalCall(amountToApprove, spender)
}
