import { FC, useCallback, useEffect, useMemo, useState } from "react"

import { useAccount } from "../../accounts/accounts.state"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxAccountDeploymentFeeEstimation } from "./utils"
import { estimatedFeeToTotal } from "../../../../shared/transactionSimulation/utils"
import { FeeEstimationContainerV2 } from "../transactionV2/FeeEstimationContainerV2"
import { useBestFeeToken } from "../useBestFeeToken"
import { AccountError } from "../../../../shared/errors/account"
import { classHashSupportsTxV3 } from "../../../../shared/network/txv3"
import { FeeTokenPickerModal } from "./ui/FeeTokenPickerModal"
import { useFeeTokenBalances } from "../../accountTokens/useFeeTokenBalance"
import { feeTokenService } from "../../../services/feeToken"
import { BaseToken } from "../../../../shared/token/__new/types/token.model"

type DeployAccountFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactionAction"
>

export const DeployAccountFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({ accountAddress, actionHash, onErrorChange, networkId }) => {
  const account = useAccount({ address: accountAddress, networkId })

  if (!account) {
    throw new AccountError({ code: "NOT_FOUND" })
  }

  const feeToken = useBestFeeToken(account)
  const feeTokens = useFeeTokenBalances(account)
  const { fee, error, loading } = useMaxAccountDeploymentFeeEstimation(
    { address: accountAddress, networkId },
    actionHash,
    feeToken.address,
  )
  const [isFeeTokenPickerOpen, setIsFeeTokenPickerOpen] = useState(false)

  const deployAccountTotal = useMemo(() => {
    if (!fee) {
      return undefined
    }
    return estimatedFeeToTotal(fee)
  }, [fee])

  const enoughBalance = useMemo(
    () =>
      Boolean(
        deployAccountTotal &&
          feeToken &&
          feeToken.balance >= deployAccountTotal,
      ),
    [deployAccountTotal, feeToken],
  )

  const showFeeError = Boolean(fee && feeToken && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeToken || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  // For undeployed txV3 accounts, this will be true
  // For undeployed txV1 accounts, this needs to be false, as we don't want the user to deploy + upgrade from this screen
  const allowFeeTokenSelection = classHashSupportsTxV3(account.classHash)

  // Same as TransactionActionsContainerV2
  const setPreferredFeeToken = useCallback(async ({ address }: BaseToken) => {
    await feeTokenService.preferFeeToken(address)
    setIsFeeTokenPickerOpen(false)
  }, [])

  return (
    <>
      {fee && feeToken && (
        <FeeEstimationContainerV2
          accountAddress={accountAddress}
          networkId={networkId}
          transactionSimulationLoading={loading}
          error={error}
          fee={{ transactions: fee }}
          feeToken={feeToken}
          allowFeeTokenSelection={allowFeeTokenSelection}
          onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
        />
      )}

      <FeeTokenPickerModal
        isOpen={allowFeeTokenSelection && isFeeTokenPickerOpen}
        onClose={() => {
          setIsFeeTokenPickerOpen(false)
        }}
        tokens={feeTokens}
        onFeeTokenSelect={setPreferredFeeToken}
      />
    </>
  )
}
