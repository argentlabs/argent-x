import { compactDecrypt } from "jose"
import { encode } from "starknet"

import { getAccounts } from "../shared/account/store"
import { RecoveryMessage } from "../shared/messages/RecoveryMessage"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { downloadFile } from "./download"

export const handleRecoveryMessage: HandleMessage<RecoveryMessage> = async ({
  msg,
  messagingKeys: { privateKey },
  background: { wallet, transactionTracker },
}) => {
  switch (msg.type) {
    case "RECOVER_BACKUP": {
      try {
        await wallet.importBackup(msg.data)
        return sendMessageToUi({ type: "RECOVER_BACKUP_RES" })
      } catch (error) {
        return sendMessageToUi({
          type: "RECOVER_BACKUP_REJ",
          data: `${error}`,
        })
      }
    }

    case "DOWNLOAD_BACKUP_FILE": {
      await downloadFile(await wallet.exportBackup())
      return sendMessageToUi({ type: "DOWNLOAD_BACKUP_FILE_RES" })
    }

    case "RECOVER_SEEDPHRASE": {
      try {
        const { secure, body } = msg.data
        if (secure !== true) {
          throw Error("session can only be started with encryption")
        }
        const { plaintext } = await compactDecrypt(body, privateKey)
        const {
          seedPhrase,
          newPassword,
        }: {
          seedPhrase: string
          newPassword: string
        } = JSON.parse(encode.arrayBufferToString(plaintext))

        await wallet.restoreSeedPhrase(seedPhrase, newPassword)
        transactionTracker.loadHistory(await getAccounts())

        return sendMessageToUi({ type: "RECOVER_SEEDPHRASE_RES" })
      } catch (error) {
        console.error(error)
        return sendMessageToUi({ type: "RECOVER_SEEDPHRASE_REJ" })
      }
    }
  }

  throw new UnhandledMessage()
}
