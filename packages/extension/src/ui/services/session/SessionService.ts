import { encryptForBackground } from "../crypto"
import { messageClient } from "../trpc"
import { ISessionService } from "./ISessionService"

export class SessionService implements ISessionService {
  constructor(private trpcMessageClient: typeof messageClient) {}
  async startSession(password: string) {
    const encryptedPassword = await encryptForBackground(password)
    return this.trpcMessageClient.session.start.mutate(encryptedPassword)
  }
  async stopSession() {
    await this.trpcMessageClient.session.stop.mutate()
  }
  async checkPassword(password: string) {
    const encryptedPassword = await encryptForBackground(password)
    return this.trpcMessageClient.session.checkPassword.mutate(
      encryptedPassword,
    )
  }
  async getIsPasswordSet() {
    return this.trpcMessageClient.session.isPasswordSet.query()
  }
}
