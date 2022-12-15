import { getKnownDappForContractAddress } from "../../../../../shared/knownDapps"
import { Transaction } from "../../../../../shared/transactions"
import { ActivityTransaction } from "../../useActivity"
import { getCallsFromTransaction } from "../transaction/getCallsFromTransaction"

/**
 * Crude test if any call `contractAddress` is a known dapp
 */

export const getKnownDappForTransaction = (
  transaction: ActivityTransaction | Transaction,
  network?: string,
) => {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    const dapp = getKnownDappForContractAddress(call.contractAddress, network)
    if (dapp) {
      return { dapp, dappContractAddress: call.contractAddress }
    }
  }
}
