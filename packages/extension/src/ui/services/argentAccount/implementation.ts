import { messageClient } from "../messaging/trpc"
import { IArgentAccountServiceUI } from "../../../shared/argentAccount/interface"
import { booleanToStringSchema } from "@argent/shared"
import { EmailPreferences } from "../../../shared/argentAccount/schema"

export class ArgentAccountService implements IArgentAccountServiceUI {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async addAccount() {
    return await this.trpcMessageClient.argentAccount.addAccount.mutate()
  }

  requestEmail(email: string) {
    return this.trpcMessageClient.argentAccount.requestEmail.mutate({
      email,
    })
  }

  confirmEmail(code: string) {
    return this.trpcMessageClient.argentAccount.confirmEmail.mutate({
      code,
    })
  }

  validateAccount() {
    return this.trpcMessageClient.argentAccount.validateAccount.mutate()
  }

  isTokenExpired() {
    return this.trpcMessageClient.argentAccount.isTokenExpired.query()
  }

  logout() {
    return this.trpcMessageClient.argentAccount.logout.mutate()
  }

  updateEmailPreferences(emailPreferences: EmailPreferences) {
    return this.trpcMessageClient.argentAccount.updatePreferences.mutate({
      preferences: {
        isNewsletterEnabled: {
          value: booleanToStringSchema.parse(
            emailPreferences.isNewsletterEnabled,
          ),
          platform: null,
        },
        isAnnouncementsEnabled: {
          value: booleanToStringSchema.parse(
            emailPreferences.isAnnouncementsEnabled,
          ),
          platform: null,
        },
      },
    })
  }

  getPreferences() {
    return this.trpcMessageClient.argentAccount.getPreferences.query()
  }
}
