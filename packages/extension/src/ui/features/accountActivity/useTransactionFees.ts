import useSWR from "swr"

import { Network, getProvider } from "../../../shared/network"
import { TransformedTransaction } from "./transform/type"

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
    const receipt = await getProvider(network).getTransactionReceipt(hash)

    const transactionFees =
      "actual_fee" in receipt ? receipt.actual_fee : undefined

    return transactionTransformed.actualFee ?? transactionFees
  }

  const { data: txFee } = useSWR(
    [hash, network.id, transactionTransformed.actualFee, "fee"],
    getFeeFromStarknetJs,
  )

  return txFee
}
