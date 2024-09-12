import { AddSmartAccountRequest } from "@argent/x-shared"
import { Flow } from "../../../shared/argentAccount/schema"
import { messageClient } from "../trpc"
import type { IClientArgentAccountService } from "./IClientArgentAccountService"

export class ClientArgentAccountService implements IClientArgentAccountService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async addGuardianToAccount() {
    return await this.trpcMessageClient.argentAccount.addGuardianAccount.mutate()
  }

  async addSmartAccount(request: AddSmartAccountRequest) {
    return await this.trpcMessageClient.argentAccount.addSmartAccount.mutate(
      request,
    )
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

  validateAccount(flow: Flow) {
    return this.trpcMessageClient.argentAccount.validateAccount.mutate(flow)
  }

  isTokenExpired() {
    return this.trpcMessageClient.argentAccount.isTokenExpired.query()
  }

  logout() {
    return this.trpcMessageClient.argentAccount.logout.mutate()
  }
}
