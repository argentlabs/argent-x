import { FC, useCallback, useState } from "react"

import {
  classHashSupportsTxV3,
  isEqualAddress,
  TokenWithBalance,
} from "@argent/x-shared"
import { num } from "starknet"
import { AccountError } from "../../../../shared/errors/account"
import { BaseToken } from "../../../../shared/token/__new/types/token.model"
import { feeTokenService } from "../../../services/feeToken"
import { useWalletAccount } from "../../accounts/accounts.state"
import { useFeeTokenBalances } from "../../accountTokens/useFeeTokenBalance"
import { FeeEstimationContainerV2 } from "../transactionV2/FeeEstimationContainerV2"
import { useFeeTokenSelection } from "../transactionV2/useFeeTokenSelection"
import { useDefaultFeeToken } from "../useDefaultFeeToken"
import { TransactionsFeeEstimationProps } from "./types"
import { FeeTokenPickerModal } from "./ui/FeeTokenPickerModal"
import { useMaxAccountDeploymentFeeEstimation } from "./utils"

type DeployAccountFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactionAction" | "feeToken"
> & {
  feeToken: TokenWithBalance
  setFeeToken: (token: TokenWithBalance) => void
}

export const DeployAccountFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({
  accountAddress,
  actionHash,
  onErrorChange,
  networkId,
  feeToken,
  setFeeToken,
}) => {
  const account = useWalletAccount({ address: accountAddress, networkId })

  if (!account) {
    throw new AccountError({ code: "NOT_FOUND" })
  }

  const defaultFeeToken = useDefaultFeeToken(account)
  const feeTokens = useFeeTokenBalances(account)

  const [isFeeTokenSelectionReady, setIsFeeTokenSelectionReady] =
    useState(false)

  const { fee, error, loading } = useMaxAccountDeploymentFeeEstimation(
    { address: accountAddress, networkId },
    actionHash,
    feeToken?.address,
  )
  const [isFeeTokenPickerOpen, setIsFeeTokenPickerOpen] = useState(false)

  useFeeTokenSelection({
    isFeeTokenSelectionReady,
    setIsFeeTokenSelectionReady,
    feeToken,
    setFeeToken,
    account,
    fee,
    defaultFeeToken,
    feeTokens,
  })

  // For undeployed txV3 accounts, this will be true
  // For undeployed txV1 accounts, this needs to be false, as we don't want the user to deploy + upgrade from this screen
  const allowFeeTokenSelection = classHashSupportsTxV3(account.classHash)

  const setPreferredFeeToken = useCallback(
    async ({ address }: BaseToken) => {
      await feeTokenService.preferFeeToken(address)
      const newFeeToken = feeTokens.find((token) =>
        isEqualAddress(token.address, address),
      )
      if (newFeeToken) {
        setFeeToken({
          ...newFeeToken,
          balance: num.toBigInt(newFeeToken.balance ?? 0),
        })
      }
      setIsFeeTokenPickerOpen(false)
    },
    [feeTokens],
  )

  return (
    <>
      {fee && feeToken && isFeeTokenSelectionReady && (
        <FeeEstimationContainerV2
          accountAddress={accountAddress}
          networkId={networkId}
          transactionSimulationLoading={loading}
          error={error}
          fee={{ transactions: fee }}
          feeToken={feeToken}
          allowFeeTokenSelection={allowFeeTokenSelection}
          onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
          onErrorChange={onErrorChange}
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
