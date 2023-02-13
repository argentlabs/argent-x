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
  const getFeeFromStarknetJs = async () => {
    const receipt = await getProvider(network).getTransactionReceipt(hash)
    return transactionTransformed.actualFee ?? receipt.actual_fee
  }

  const { data: txFee } = useSWR(
    [hash, network, transactionTransformed.actualFee],
    getFeeFromStarknetJs,
  )

  return txFee
}
