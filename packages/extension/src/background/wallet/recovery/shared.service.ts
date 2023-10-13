import { ethers } from "ethers"

import { defaultNetworks } from "../../../shared/network"
import { INetworkService } from "../../../shared/network/service/interface"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import { WalletAccount } from "../../../shared/wallet.model"
import { WalletStorageProps } from "../account/shared.service"
import { WalletSession } from "../session/walletSession.model"
import { Events, IWalletRecoveryService, Recovered } from "./interface"
import { WalletError } from "../../../shared/errors/wallet"
import Emittery from "emittery"

export class WalletRecoverySharedService {
  constructor(
    readonly emitter: Emittery<Events>,
    public readonly store: IObjectStore<WalletStorageProps>,
    private readonly walletStore: IRepository<WalletAccount>,
    public readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly chainRecoveryService: IWalletRecoveryService,
  ) {}

  public async discoverAccounts() {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    const wallet = new ethers.Wallet(session?.secret)

    const networks = defaultNetworks.map((network) => network.id)

    const accounts = []

    for (const networkId of networks) {
      const network = await this.networkService.getById(networkId)
      const accountResults =
        await this.chainRecoveryService.restoreAccountsFromWallet(
          wallet.privateKey,
          network,
        )
      accounts.push(...accountResults)
    }

    await this.walletStore.upsert(accounts)
    void this.store.set({ discoveredOnce: true })

    await this.emitter.emit(Recovered, accounts)
    return accounts
  }
}
