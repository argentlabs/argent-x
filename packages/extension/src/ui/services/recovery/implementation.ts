import { encryptForBackground } from "../crypto"
import { messageClient } from "../messaging/trpc"
import { IRecoveryService } from "./interface"

export class RecoveryService implements IRecoveryService {
  async byBackup(backup: string) {
    await messageClient.recovery.recoverBackup.mutate({ backup })
  }

  async bySeedPhrase(seedPhrase: string, newPassword: string) {
    const message = JSON.stringify({ seedPhrase, newPassword })
    const jwe = await encryptForBackground(message)
    await messageClient.recovery.recoverSeedPhrase.mutate({ jwe })
  }
}
