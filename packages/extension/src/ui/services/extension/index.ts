import { sendMessage, waitForMessage } from "../../../shared/messages"
import { encryptForBackground } from "../crypto"
import { ClientExtensionServiceWithLegacyMessagingSystem } from "./clientLegacy"

// export interfaces
export { IExtensionService } from "./interface"

// export singletons
export const extensionService =
  new ClientExtensionServiceWithLegacyMessagingSystem(
    sendMessage,
    waitForMessage,
    encryptForBackground,
  )
