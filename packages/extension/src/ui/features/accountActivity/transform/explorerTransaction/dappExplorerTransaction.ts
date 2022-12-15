import {
  IExplorerTransaction,
  IExplorerTransactionCall,
  IExplorerTransactionEvent,
} from "../../../../../shared/explorer/type"
import { getKnownDappForContractAddress } from "../../../../../shared/knownDapps"

/**
 * Crude test if any event or call `address` or parameter value is a known dapp
 */

export const getKnownDappForExplorerTransaction = (
  explorerTransaction: IExplorerTransaction,
  network?: string,
) => {
  const { calls, events } = explorerTransaction
  const eventsAndCalls: Array<
    IExplorerTransactionEvent | IExplorerTransactionCall
  > = calls ? [...events, ...calls] : events
  for (const eventsOrCall of eventsAndCalls) {
    const { address, parameters } = eventsOrCall
    const dapp = getKnownDappForContractAddress(address, network)
    if (dapp) {
      return { dapp, dappContractAddress: address }
    }
    for (const { value } of parameters) {
      const dapp = getKnownDappForContractAddress(value, network)
      if (dapp) {
        return { dapp, dappContractAddress: value }
      }
    }
  }
}
