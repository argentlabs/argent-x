import useSWR from "swr"

import { Network, getProvider } from "../../../shared/network"
import { TransformedTransaction } from "../../../shared/activity/utils/transform/type"
import { isString } from "lodash-es"

export const useTransactionFees = ({
  network,
  transactionTransformed,
  hash,
}: {
  network: Network
  transactionTransformed: TransformedTransaction
  hash?: string
}) => {
  const getFeeFromStarknetJs = async (hash?: string) => {
    if (!hash) {
      return
    }
    // TODO: TXV3 - use actual fee from transactionTransformed as soon as backend supports the fee for both tokens
    // if (transactionTransformed.actualFee) {
    //   return transactionTransformed.actualFee
    // }

    const receipt = await getProvider(network).getTransactionReceipt(hash)

    const transactionFees =
      "actual_fee" in receipt && !isString(receipt.actual_fee)
        ? receipt.actual_fee
        : undefined

    return transactionFees
  }

  const { data: txFee } = useSWR(
    [hash, network.id, transactionTransformed.actualFee, "fee"],
    getFeeFromStarknetJs,
  )

  return txFee
}
