import { getKnownDappForTransaction } from "../../explorerTransaction/dappTransaction"
import { ITransactionTransformer } from "./type"

/** adds known dapp and contract address */

export default function ({ transaction, result }: ITransactionTransformer) {
  const knownDapp = getKnownDappForTransaction(transaction)
  if (knownDapp) {
    const { dapp, dappContractAddress } = knownDapp
    /** omit the contracts */
    const { contracts: _contracts, ...rest } = dapp
    result = {
      ...result,
      entity: "DAPP",
      dapp: rest,
      dappContractAddress,
    }
  }
  return result
}
