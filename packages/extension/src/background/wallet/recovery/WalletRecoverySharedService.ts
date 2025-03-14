import { defaultNetworks } from "../../../shared/network"
import type { INetworkService } from "../../../shared/network/service/INetworkService"
import type {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { Events, IWalletRecoveryService } from "./IWalletRecoveryService"
import { Recovered } from "./IWalletRecoveryService"
import { WalletError } from "../../../shared/errors/wallet"
import type Emittery from "emittery"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"
import { isEqualAddress } from "@argent/x-shared"
import type { ISecretStorageService } from "../session/interface"

export class WalletRecoverySharedService {
  constructor(
    readonly emitter: Emittery<Events>,
    public readonly store: IObjectStore<WalletStorageProps>,
    private readonly walletStore: IRepository<WalletAccount>,
    public readonly secretStorageService: ISecretStorageService,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly chainRecoveryService: IWalletRecoveryService,
  ) {}

  public async discoverAccounts() {
    const decrypted = await this.secretStorageService.decrypt()
    if (!decrypted) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }

    const { secret } = decrypted

    const networks = defaultNetworks.map((network) => network.id)

    const accounts = []

    for (const networkId of networks) {
      const network = await this.networkService.getById(networkId)
      const accountResults =
        await this.chainRecoveryService.restoreAccountsFromWallet(
          secret,
          network,
        )
      accounts.push(...accountResults)
    }

    await this.walletStore.upsert(accounts)
    void this.store.set({ discoveredOnce: true })

    await this.emitter.emit(Recovered, accounts)
    return accounts
  }

  public async restoreMultisigAccountsFromLedger(networkId: string) {
    const network = await this.networkService.getById(networkId)

    const currentAccounts = await this.walletStore.get()

    const recoveredMultisigs =
      await this.chainRecoveryService.restoreMultisigAccountsFromLedger(network)

    const newlyDiscoveredMultisigs = recoveredMultisigs.filter(
      ({ account }) =>
        !currentAccounts.some((cu) =>
          isEqualAddress(cu.address, account.address),
        ),
    )

    const walletAccounts = newlyDiscoveredMultisigs.map(
      ({ account }) => account,
    )
    await this.walletStore.upsert(walletAccounts)

    await this.emitter.emit(Recovered, walletAccounts)
    return newlyDiscoveredMultisigs
  }
}
