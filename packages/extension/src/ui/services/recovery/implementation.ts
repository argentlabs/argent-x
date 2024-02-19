import { encryptForBackground } from "../crypto"
import { messageClient } from "../messaging/trpc"
import { IRecoveryService } from "../../../shared/recovery/service/interface"

export class ClientRecoveryService implements IRecoveryService {
  async byBackup(backup: string) {
    await messageClient.recovery.recoverBackup.mutate({ backup })
  }

  async bySeedPhrase(seedPhrase: string, newPassword: string) {
    const message = JSON.stringify({ seedPhrase, newPassword })
    const jwe = await encryptForBackground(message)
    await messageClient.recovery.recoverSeedPhrase.mutate({ jwe })
  }

  async clearErrorRecovering() {
    return messageClient.recovery.clearErrorRecovering.mutate()
  }
}
