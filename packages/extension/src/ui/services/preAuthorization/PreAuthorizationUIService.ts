import type { messageClient } from "../trpc"
import type { IPreAuthorizationService } from "../../../shared/preAuthorization/IPreAuthorizationService"
import type { PreAuthorization } from "../../../shared/preAuthorization/schema"
import type { BaseWalletAccount } from "../../../shared/wallet.model"

export class PreAuthorizationUIService
  implements Partial<IPreAuthorizationService>
{
  constructor(
    private trpcMessageClient: typeof messageClient,
    private preAuthorizationService: IPreAuthorizationService,
  ) {}

  async remove(preAuthorization: PreAuthorization) {
    await this.preAuthorizationService.remove(preAuthorization)
    await this.trpcMessageClient.preAuthorization.disconnect.mutate(
      preAuthorization.host,
    )
  }

  async removeAll(account: BaseWalletAccount) {
    const preAuthorizationToRemove =
      await this.preAuthorizationService.removeAll(account)

    await Promise.all(
      preAuthorizationToRemove.map((preAuthorization) => {
        return this.trpcMessageClient.preAuthorization.disconnect.mutate(
          preAuthorization.host,
        )
      }),
    )

    return preAuthorizationToRemove
  }
}
