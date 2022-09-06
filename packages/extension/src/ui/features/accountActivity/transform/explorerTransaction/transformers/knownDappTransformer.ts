import { getKnownDappForExplorerTransaction } from "../dappExplorerTransaction"
import { IExplorerTransactionTransformer } from "./type"

/** adds known dapp and contract address */

export default function ({
  explorerTransaction,
  result,
}: IExplorerTransactionTransformer) {
  const knownDapp = getKnownDappForExplorerTransaction(explorerTransaction)
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
