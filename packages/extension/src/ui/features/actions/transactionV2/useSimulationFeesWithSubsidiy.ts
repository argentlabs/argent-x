import type { EnrichedSimulateAndReviewV2 } from "@argent/x-shared/simulation"
import { useMemo } from "react"
import type { WalletAccount } from "../../../../shared/wallet.model"
import type { Call } from "starknet"

export const useSimulationFeesWithSubsidiy = (
  transactionReview: EnrichedSimulateAndReviewV2 = {},
  selectedAccount?: WalletAccount,
  transactions: Call[] = [],
) => {
  return useMemo(() => {
    if (!transactionReview || !selectedAccount) {
      return { simulationFees: [], isSubsidised: false }
    }

    const allFees = transactionReview.enrichedFeeEstimation ?? []

    const nativeFees = allFees.filter((fee) => fee.type === "native")

    const hasSelfAccountTransaction = transactions.some((tx) =>
      [
        "upgrade",
        "set_escape_security_period",
        "trigger_escape_guardian",
        "escape_guardian",
        "change_guardian",
        "cancel_escape",
        "revoke_session",
        "change_owner",
        "change_guardian_backup",
      ].includes(tx.entrypoint),
    )

    const { subsidiseDeployment, subsidiseTransaction } =
      transactionReview.subsidyStatus ?? {}

    const needsDeploy = selectedAccount?.needsDeploy
    const isSubsidised = needsDeploy
      ? subsidiseDeployment
      : subsidiseTransaction && hasSelfAccountTransaction

    // Only use native fees when:
    // 1. Account needs deployment but subsidising is off, or
    // 2. It's a self-account transaction and subsidising is off

    const useNativeFees =
      (needsDeploy || hasSelfAccountTransaction) && !isSubsidised

    const simulationFees = useNativeFees ? nativeFees : allFees
    return { simulationFees, isSubsidised }
  }, [selectedAccount, transactionReview, transactions])
}
