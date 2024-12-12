import type { ILedgerService } from "./ILedgerService"
import { messageClient } from "../trpc"
import type { Address } from "@argent/x-shared"
import type { ImportedLedgerAccount } from "../../../shared/wallet.model"

export class LedgerService implements ILedgerService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async connect(): Promise<Address> {
    try {
      return this.trpcMessageClient.ledger.connect.mutate()
    } catch (error) {
      console.error(error)
      throw new Error("Failed to connect to Ledger device")
    }
  }

  async getLedgerAccounts(networkId: string, startIndex = 0, total = 10) {
    return messageClient.ledger.getLedgerAccounts.query({
      networkId,
      startIndex,
      total,
    })
  }

  async addLedgerAccounts(
    importedLedgerAccounts: ImportedLedgerAccount[],
    networkId: string,
  ) {
    return messageClient.ledger.addLedgerAccounts.mutate({
      importedLedgerAccounts,
      networkId,
    })
  }

  async restoreMultisig(networkId: string) {
    try {
      return this.trpcMessageClient.ledger.restoreMultisig.mutate({ networkId })
    } catch (error) {
      console.error(error)
      throw new Error("Failed to restore multisig account from Ledger device")
    }
  }
}
