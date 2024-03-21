import { analyticsService } from "../../../../shared/analytics"
import { IRecoveryService } from "../../../../shared/recovery/service/interface"
import { recoveredAtKeyValueStore } from "../../../../shared/recovery/storage"
import { IRecoveryStorage } from "../../../../shared/recovery/types"
import { IObjectStore } from "../../../../shared/storage/__new/interface"
import { TransactionTrackerWorker } from "../../../transactions/service/starknet.service"
import { Wallet } from "../../../wallet"

export class BackgroundRecoveryService implements IRecoveryService {
  constructor(
    private readonly recoveryStore: IObjectStore<IRecoveryStorage>,
    private readonly wallet: Wallet,
    private readonly transactionTracker: TransactionTrackerWorker,
  ) {}

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
    } catch (error) {
      console.error(error)
      await this.setErrorRecovering(`${error}`)
      throw error
    } finally {
      await this.updateLastRecoveredAt()
      await this.setIsRecovering(false)
      analyticsService.walletRestored()
    }
  }

  private async updateLastRecoveredAt() {
    const lastRecoveredAt = await recoveredAtKeyValueStore.get(
      "lastRecoveredAt",
    )
    if (lastRecoveredAt === null) {
      void recoveredAtKeyValueStore.set("lastRecoveredAt", Date.now())
    }
  }

  async bySeedPhrase(seedPhrase: string, newPassword: string) {
    try {
      await this.clearErrorRecovering()
      await this.setIsRecovering(true)
      await this.wallet.restoreSeedPhrase(seedPhrase, newPassword)
      void this.transactionTracker.loadHistory()
    } catch (error) {
      console.error(error)
      await this.setErrorRecovering(`${error}`)
      throw error
    } finally {
      await this.updateLastRecoveredAt()
      await this.setIsRecovering(false)
      analyticsService.walletRestored()
    }
  }

  async clearErrorRecovering() {
    await this.setErrorRecovering(false)
  }
}
