import { EncryptJWT, compactDecrypt, importJWK } from "jose"
import { encode } from "starknet"

import { MiscenalleousMessage as MiscellaneousMessage } from "../shared/messages/MiscellaneousMessage"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"
import { clearStorage } from "./storage"

export const handleMiscellaneousMessage: HandleMessage<
  MiscellaneousMessage
> = async ({
  msg,
  background: { wallet },
  messagingKeys: { publicKeyJwk, privateKey },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "OPEN_UI": {
      return openUi()
    }

    case "RESET_ALL": {
      clearStorage()
      wallet.reset()
      return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
    }

    case "GET_PUBLIC_KEY": {
      return sendMessageToUi({
        type: "GET_PUBLIC_KEY_RES",
        data: publicKeyJwk,
      })
    }

    case "EXPORT_PRIVATE_KEY": {
      const privateKey = await wallet.exportPrivateKey()

      return sendToTabAndUi({
        type: "EXPORT_PRIVATE_KEY_RES",
        data: { privateKey },
      })
    }

    case "GET_ENCRYPTED_SEED_PHRASE": {
      if (!wallet.isSessionOpen()) {
        throw Error("you need an open session")
      }
      const { encryptedSecret } = msg.data
      const { plaintext } = await compactDecrypt(encryptedSecret, privateKey)

      const symmetricSecret = await importJWK(
        JSON.parse(encode.arrayBufferToString(plaintext)),
      )
      const seedPhrase = await wallet.getSeedPhrase()
      const encryptedSeedPhrase = await new EncryptJWT({
        seedPhrase,
      })
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .encrypt(symmetricSecret)

      return sendMessageToUi({
        type: "GET_ENCRYPTED_SEED_PHRASE_RES",
        data: { encryptedSeedPhrase },
      })
    }
  }

  throw new UnhandledMessage()
}
