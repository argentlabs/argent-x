import { Network } from "../../../shared/network"
import {
  BaseWalletAccount,
  RecoveredLedgerMultisig,
  WalletAccount,
} from "../../../shared/wallet.model"

export interface IWalletRecoveryService {
  restoreAccountsFromWallet(
    secret: string,
    network: Network,
  ): Promise<WalletAccount[]>
  restoreMultisigAccountsFromLedger(
    network: Network,
    initialPubKeyCount?: number,
  ): Promise<RecoveredLedgerMultisig[]>
}

export const Recovered = Symbol("Recovered")

export type Events = {
  [Recovered]: BaseWalletAccount[]
}
