import useSWRImmutable from "swr/immutable"

import {
  nativeEstimatedFeeSchema,
  type NativeEstimatedFee,
} from "@argent/x-shared/simulation"
import { isString } from "lodash-es"
import type { ErrorObject } from "../../../../shared/utils/error"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { getAccountDeploymentEstimatedFee } from "../../../services/backgroundTransactions"
import { useRef } from "react"

interface UseMaxAccountDeploymentFeeEstimationReturnProps {
  fee: NativeEstimatedFee | undefined
  error: ErrorObject | undefined
  loading: boolean
}

export const useMaxAccountDeploymentFeeEstimation = (
  account: BaseWalletAccount | undefined,
  actionHash: string,
  feeTokenAddress?: string,
): UseMaxAccountDeploymentFeeEstimationReturnProps => {
  const fetcher = feeTokenAddress
    ? async () => {
        const fee = await getAccountDeploymentEstimatedFee(
          feeTokenAddress,
          account,
        )
        return nativeEstimatedFeeSchema.parse(fee) // Account deployment fee is always native
      }
    : null

  // CacheBust is needed to force when the component is mounted, as actionHash will be same because
  // the account deployment payload remains the same
  const cacheBust = useRef(Date.now())

  const {
    data: fee,
    error,
    isValidating,
  } = useSWRImmutable(
    account && feeTokenAddress
      ? [
          actionHash,
          "accountDeploymentFeeEstimation",
          feeTokenAddress,
          cacheBust,
        ]
      : null,
    fetcher,
    { shouldRetryOnError: false },
  )
  return { fee, error, loading: !fee && isValidating }
}

export function getTooltipText(
  maxFee?: bigint,
  feeTokenBalance?: bigint | string,
) {
  if (!maxFee || !feeTokenBalance) {
    return "Network fee is still loading."
  }
  if (isString(feeTokenBalance)) {
    // FIXME: this is string '0' if the fee token is not deployed?
    feeTokenBalance = BigInt(feeTokenBalance)
  }
  if (feeTokenBalance >= maxFee) {
    return "Network fees are paid to the network to include transactions in blocks"
  }
  return `Insufficient balance to pay network fees. You need to add more funds to be able to execute the transaction.`
}
