import type { IOnboardingService } from "../../../shared/onboarding/IOnboardingService"
import type { messageClient } from "../trpc"

export class ClientOnboardingService
  implements Pick<IOnboardingService, "getOnboardingComplete">
{
  constructor(private readonly trpcClient: typeof messageClient) {}

  async getOnboardingComplete() {
    return await this.trpcClient.onboarding.getOnboardingComplete.query()
  }
}
