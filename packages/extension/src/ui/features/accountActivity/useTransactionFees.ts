import { useEffect, useState } from "react"

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
  const [txFee, setTxFee] = useState<string | undefined>()
  useEffect(() => {
    const getFeeFromStarknetJs = async () => {
      const receipt = await getProvider(network).getTransactionReceipt(hash)
      setTxFee(transactionTransformed.actualFee ?? receipt.actual_fee)
    }
    getFeeFromStarknetJs()
  }, [hash, network, transactionTransformed.actualFee])
  return txFee
}
