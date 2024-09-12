import { ampli } from "../../../shared/analytics"
import type { IRecoveryService } from "../../../shared/recovery/IRecoveryService"
import { recoveredAtKeyValueStore } from "../../../shared/recovery/storage"
import type { IRecoveryStorage } from "../../../shared/recovery/types"
import type { IObjectStore } from "../../../shared/storage/__new/interface"
import { TransactionTrackerWorker } from "../transactionTracker/worker/TransactionTrackerWorker"
import type { Wallet } from "../../wallet"
import { sanitiseSelectedAccount } from "../../../shared/wallet/sanitiseSelectedAccount"

export class BackgroundRecoveryService implements IRecoveryService {
  constructor(
    private readonly recoveryStore: IObjectStore<IRecoveryStorage>,
    private readonly wallet: Wallet,
    private readonly transactionTracker: TransactionTrackerWorker,
  ) {
    /** ensure the selected account is still available */
    void sanitiseSelectedAccount()
  }

  private async setIsRecovering(isRecovering: boolean) {
    await this.recoveryStore.set({ isRecovering })
  }

  private async setErrorRecovering(errorRecovering: string | false) {
    await this.recoveryStore.set({ errorRecovering })
  }

  async byBackup(backup: string) {
    try {
      await this.clearErrorRecovering()
      await this.setIsRecovering(true)
      await this.wallet.importBackup(backup)
      await sanitiseSelectedAccount()
    } catch (error) {
      console.error(error)
      await this.setErrorRecovering(`${error}`)
      throw error
    } finally {
      await this.updateLastRecoveredAt()
      await this.setIsRecovering(false)
      ampli.walletRestored({ "wallet platform": "browser extension" })
    }
  }

  private async updateLastRecoveredAt() {
    const lastRecoveredAt =
      await recoveredAtKeyValueStore.get("lastRecoveredAt")
    if (lastRecoveredAt === null) {
      void recoveredAtKeyValueStore.set("lastRecoveredAt", Date.now())
    }
  }

  async bySeedPhrase(seedPhrase: string, newPassword: string) {
    try {
      await this.clearErrorRecovering()
      await this.setIsRecovering(true)
      await this.wallet.restoreSeedPhrase(seedPhrase, newPassword)
      await sanitiseSelectedAccount()
      void this.transactionTracker.loadHistory()
    } catch (error) {
      console.error(error)
      await this.setErrorRecovering(`${error}`)
      throw error
    } finally {
      await this.updateLastRecoveredAt()
      await this.setIsRecovering(false)
      ampli.walletRestored({ "wallet platform": "browser extension" })
    }
  }

  async clearErrorRecovering() {
    await this.setErrorRecovering(false)
  }
}
