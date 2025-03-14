import { estimatedFeesToMaxFeeTotalV2, isEqualAddress } from "@argent/x-shared"
import type { TokenWithBalance } from "@argent/x-shared"
import type { EnrichedSimulateAndReviewV2 } from "@argent/x-shared/simulation"

type UseCheckGasFeeBalance = {
  result?: EnrichedSimulateAndReviewV2
  feeTokenWithBalance: TokenWithBalance
}

export const useCheckGasFeeBalance = ({
  result = {},
  feeTokenWithBalance,
}: UseCheckGasFeeBalance) => {
  const { address: feeTokenAddress, balance: feeTokenBalance } =
    feeTokenWithBalance

  let isSendingMoreThanBalanceAndGas = false
  const sendTransaction = result.transactions?.find((t) =>
    t?.simulation?.summary?.find((s) => s.sent),
  )
  if (!sendTransaction || !sendTransaction.simulation?.summary) {
    return isSendingMoreThanBalanceAndGas
  }

  const tokensSentAddresses = sendTransaction.simulation.summary
    .filter((s) => s.sent)
    .map((s) => s.token.address)

  const feeEstimation = result.enrichedFeeEstimation?.find((f) =>
    isEqualAddress(f.transactions.feeTokenAddress, feeTokenAddress),
  )

  const shouldCheckIfAccountHasEnoughBalance =
    feeEstimation?.transactions.feeTokenAddress &&
    tokensSentAddresses.includes(feeEstimation.transactions.feeTokenAddress)

  if (
    !shouldCheckIfAccountHasEnoughBalance ||
    (feeEstimation?.type === "native" && !feeEstimation.transactions?.max) || // native fee
    (feeEstimation?.type === "paymaster" && !feeEstimation.transactions?.maxFee) // paymaster fee
  ) {
    return isSendingMoreThanBalanceAndGas
  }

  const feeAmount = estimatedFeesToMaxFeeTotalV2(feeEstimation)

  const sentAmount = sendTransaction.simulation.summary.find(
    (s) => s.sent && isEqualAddress(s.token.address, feeTokenAddress),
  )?.value

  const receivedAmount = sendTransaction.simulation.summary.find(
    (s) => !s.sent && isEqualAddress(s.token.address, feeTokenAddress),
  )?.value

  if (!feeAmount || !sentAmount) {
    return isSendingMoreThanBalanceAndGas
  }
  const netSentAmount = BigInt(sentAmount) - BigInt(receivedAmount || 0)

  if (!feeTokenBalance) {
    return isSendingMoreThanBalanceAndGas
  }

  const outgoingAmount = feeAmount + netSentAmount
  const hasEnoughToPayGas = feeTokenBalance >= outgoingAmount

  if (!hasEnoughToPayGas) {
    isSendingMoreThanBalanceAndGas = true
  }
  return isSendingMoreThanBalanceAndGas
}
