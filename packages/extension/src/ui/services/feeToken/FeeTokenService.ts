import { messageClient } from "../trpc"
import { IFeeTokenService } from "./IFeeTokenService"

export class FeeTokenService implements IFeeTokenService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async preferFeeToken(tokenAddress: string): Promise<void> {
    await this.trpcMessageClient.feeToken.preferFeeToken.mutate(tokenAddress)
  }
}
