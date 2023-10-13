import { INetworkService } from "../../../shared/network/service/interface"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import backupSchema from "../../schema/backup.schema"
import { WalletError } from "../../../shared/errors/wallet"

const CURRENT_BACKUP_VERSION = 1

export interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: BaseWalletAccount | null
  discoveredOnce?: boolean
}

export class WalletBackupService {
  constructor(
    public readonly store: IObjectStore<WalletStorageProps>,
    public readonly walletStore: IRepository<WalletAccount>,
    private readonly networkService: Pick<INetworkService, "getById">,
  ) {}

  public async getBackup() {
    return (await this.store.get()).backup
  }

  public async isInitialized(): Promise<boolean> {
    return Boolean((await this.store.get()).backup)
  }

  public static validateBackup(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString)
      return backupSchema.safeParse(backup).success
    } catch {
      return false
    }
  }

  public async importBackup(backup: string): Promise<void> {
    if (!WalletBackupService.validateBackup(backup)) {
      throw new WalletError({ code: "INVALID_BACKUP_FILE" })
    }

    const backupJson = JSON.parse(backup)
    if (backupJson.argent?.version !== CURRENT_BACKUP_VERSION) {
      // in the future, backup file migration will happen here
    }

    await this.store.set({ backup })

    const accounts: WalletAccount[] = await Promise.all(
      (backupJson.argent?.accounts ?? []).map(async (account: any) => {
        const network = await this.networkService.getById(account.network)
        return {
          ...account,
          network,
          networkId: network.id,
        }
      }),
    )

    if (accounts.length > 0) {
      await this.walletStore.upsert(accounts)
    }
  }
}
