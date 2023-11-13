import { IRecoveryService } from "../../../../shared/recovery/service/interface"
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

  async byBackup(backup: string) {
    try {
      await this.setIsRecovering(true)
      await this.wallet.importBackup(backup)
    } finally {
      await this.setIsRecovering(false)
    }
  }

  async bySeedPhrase(seedPhrase: string, newPassword: string) {
    try {
      await this.setIsRecovering(true)
      await this.wallet.restoreSeedPhrase(seedPhrase, newPassword)
      void this.transactionTracker.loadHistory()
    } finally {
      await this.setIsRecovering(false)
    }
  }
}
