import type { TokenWithBalance } from "@argent/x-shared"
import {
  classHashSupportsTxV3,
  ETH_TOKEN_ADDRESS,
  isEqualAddress,
} from "@argent/x-shared"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import { useEffect, useMemo, useState } from "react"
import { equalToken } from "../../../../shared/token/__new/utils"
import type { WalletAccount } from "../../../../shared/wallet.model"
import { hasFeeTokenEnoughBalance } from "./utils/hasFeeTokenEnoughBalance"
import { useFeeFromEstimatedFees } from "./useFeeFromEstimatedFees"

interface UseFeeTokenSelectionParams {
  fees?: EstimatedFeesV2[]
  account?: WalletAccount
  defaultFeeToken: TokenWithBalance
  availableFeeTokens: TokenWithBalance[]
}

/**
 * Rule for the fee token selection:
 * 1. If the default fee token has enough balance, keep it.
 * 2. If the default fee token does not have enough balance, iterate through the feeTokens until one with enough balance is found
 * 3. If no fee token has enough balance, fallback to the default fee token
 * 4. If the account doesn't support tx v3, use ETH as the fee token
 */
export const useFeeTokenSelection = ({
  account,
  fees,
  defaultFeeToken,
  availableFeeTokens = [],
}: UseFeeTokenSelectionParams) => {
  const [isReady, setIsReady] = useState(false)
  const [feeToken, setFeeToken] = useState(defaultFeeToken)

  const fee = useFeeFromEstimatedFees(fees, feeToken)

  // Memoize sorted tokens instead of using state
  const sortedFeeTokens = useMemo(() => {
    return availableFeeTokens.sort(
      (a, b) =>
        Number(equalToken(b, defaultFeeToken)) -
        Number(equalToken(a, defaultFeeToken)),
    )
  }, [availableFeeTokens, defaultFeeToken])

  // Handle non-V3 accounts separately
  const shouldUseEth = useMemo(
    () => !classHashSupportsTxV3(account?.classHash),
    [account?.classHash],
  )

  const ethToken = useMemo(
    () =>
      sortedFeeTokens.find((t) => isEqualAddress(t.address, ETH_TOKEN_ADDRESS)),
    [sortedFeeTokens],
  )

  // Main effect for fee token selection logic
  useEffect(() => {
    if (isReady) return

    if (shouldUseEth) {
      if (ethToken) {
        setFeeToken(ethToken)
      }
      setIsReady(true)
      return
    }

    if (!feeToken || !fee) {
      return
    }

    if (hasFeeTokenEnoughBalance(feeToken, fee)) {
      setIsReady(true)
      return
    }

    // find the first token with enough balance
    const tokenWithSufficientBalance = sortedFeeTokens.find((t) =>
      fees?.some(
        (f) =>
          isEqualAddress(f.transactions.feeTokenAddress, t.address) &&
          hasFeeTokenEnoughBalance(t, f),
      ),
    )

    if (tokenWithSufficientBalance) {
      setFeeToken(tokenWithSufficientBalance)
    }

    setIsReady(true)
  }, [
    shouldUseEth,
    ethToken,
    feeToken,
    fee,
    sortedFeeTokens,
    isReady,
    setIsReady,
    defaultFeeToken,
    fees,
  ])

  return { isFeeTokenSelectionReady: isReady, feeToken, setFeeToken, fee }
}
