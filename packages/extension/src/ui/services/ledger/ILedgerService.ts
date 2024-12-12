import type { Address } from "@argent/x-shared"
import type {
  BaseWalletAccount,
  ImportedLedgerAccount,
  RecoveredLedgerMultisig,
  WalletAccount,
} from "../../../shared/wallet.model"

export interface ILedgerService {
  connect: () => Promise<Address>
  getLedgerAccounts(networkId: string): Promise<BaseWalletAccount[]>
  addLedgerAccounts: (
    importedAccounts: ImportedLedgerAccount[],
    networkId: string,
  ) => Promise<WalletAccount[]>
  restoreMultisig: (networkId: string) => Promise<RecoveredLedgerMultisig[]>
}
