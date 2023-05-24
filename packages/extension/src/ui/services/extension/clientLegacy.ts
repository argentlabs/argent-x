import type { SendMessage, WaitForMessage } from "../../../shared/messages"
import { IExtensionService } from "./interface"

export class ClientExtensionServiceWithLegacyMessagingSystem
  implements IExtensionService
{
  constructor(
    // TODO: both of these should be some message service, but I also like the idea of using trpc
    public readonly sendMessage: SendMessage,
    public readonly waitForMessage: WaitForMessage,
    // TODO: this should be some crypto/encryption service
    public readonly encryptForBackground: (password: string) => Promise<string>,
  ) {}

  async unlock(password: string): Promise<void> {
    const body = await this.encryptForBackground(password)

    void this.sendMessage({
      type: "START_SESSION",
      data: { secure: true, body },
    })

    const succeeded = await Promise.race([
      this.waitForMessage("START_SESSION_RES").then(() => true),
      this.waitForMessage("START_SESSION_REJ")
        .then(() => false)
        .catch(() => false),
      // timeout
      new Promise((resolve) =>
        setTimeout(
          () => resolve(false),
          60e3, // 1 minute
        ),
      ),
    ])

    if (!succeeded) {
      throw Error("Wrong password")
    }
  }
}
