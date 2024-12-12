import type { TokenWithBalance } from "@argent/x-shared"
import {
  classHashSupportsTxV3,
  ETH_TOKEN_ADDRESS,
  isEqualAddress,
} from "@argent/x-shared"
import type { EstimatedFee, EstimatedFees } from "@argent/x-shared/simulation"
import { useEffect, useState } from "react"
import { num } from "starknet"
import { equalToken } from "../../../../shared/token/__new/utils"
import type { WalletAccount } from "../../../../shared/wallet.model"
import { hasFeeTokenEnoughBalance } from "./utils/hasFeeTokenEnoughBalance"
import type { TokenWithBalance as TokenWithStringBalance } from "../../../../shared/token/__new/types/tokenBalance.model"

interface FeeTokenSelectionProps {
  isFeeTokenSelectionReady: boolean
  setIsFeeTokenSelectionReady: (isReady: boolean) => void
  fee?: EstimatedFees | EstimatedFee | bigint
  setFeeToken: (feeToken: TokenWithBalance) => void
  account?: WalletAccount
  feeToken: TokenWithBalance
  defaultFeeToken: TokenWithBalance
  feeTokens: TokenWithStringBalance[]
}

/**
 * Rule for the fee token selection:
 * 1. If the default fee token has enough balance, keep it.
 * 2. If the default fee token does not have enough balance, iterate through the feeTokens until one with enough balance is found
 * 3. If no fee token has enough balance, fallback to the default fee token
 * 4. If the account doesn't support tx v3, use ETH as the fee token
 */
export const useFeeTokenSelection = ({
  isFeeTokenSelectionReady,
  setIsFeeTokenSelectionReady,
  feeToken,
  setFeeToken,
  account,
  fee,
  defaultFeeToken,
  feeTokens,
}: FeeTokenSelectionProps) => {
  // helper array of fee tokens, because we need to check the default fee token first
  const [uncheckedFeeTokens] = useState<TokenWithBalance[]>(
    () =>
      feeTokens
        ?.map((token) => ({
          ...token,
          balance: num.toBigInt(token.balance ?? 0),
        }))
        .sort((a, b) => {
          if (equalToken(a, defaultFeeToken)) return -1
          if (equalToken(b, defaultFeeToken)) return 1
          return 0
        }) || [],
  )

  useEffect(() => {
    if (isFeeTokenSelectionReady) return
    if (!classHashSupportsTxV3(account?.classHash)) {
      const ethToken = uncheckedFeeTokens.find((token) =>
        isEqualAddress(token.address, ETH_TOKEN_ADDRESS),
      )
      if (ethToken) {
        setFeeToken({
          ...ethToken,
          balance: num.toBigInt(ethToken.balance ?? 0),
        })
      }
      setIsFeeTokenSelectionReady(true)
    } else if (feeToken && fee) {
      const feeTokenNeedsUpdate = !hasFeeTokenEnoughBalance(feeToken, fee)
      if (feeTokenNeedsUpdate && uncheckedFeeTokens.length) {
        const index = uncheckedFeeTokens.findIndex((token) =>
          equalToken(token, feeToken),
        )
        const newFeeToken = uncheckedFeeTokens[index + 1] || defaultFeeToken
        setFeeToken(newFeeToken)
        // If we have iterated through all the fee tokens and none have enough balance, we are ready
        setIsFeeTokenSelectionReady(index === uncheckedFeeTokens.length - 1)
      } else {
        setIsFeeTokenSelectionReady(true)
      }
    }
  }, [
    account?.type,
    account?.classHash,
    defaultFeeToken,
    feeToken,
    isFeeTokenSelectionReady,
    fee,
    uncheckedFeeTokens,
    setFeeToken,
    setIsFeeTokenSelectionReady,
  ])
}
