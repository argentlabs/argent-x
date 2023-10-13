import { Network } from "../../../shared/network"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"

export interface IWalletRecoveryService {
  restoreAccountsFromWallet(
    secret: string,
    network: Network,
  ): Promise<WalletAccount[]>
}

export const Recovered = Symbol("Recovered")

export type Events = {
  [Recovered]: BaseWalletAccount[]
}
