import { getKnownDappForContractAddress } from "../../../../knownDapps"
import { Transaction } from "../../../../transactions"
import { ActivityTransaction } from "../type"
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
