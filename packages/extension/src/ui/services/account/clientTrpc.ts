import { CreateAccountType, WalletAccount } from "../../../shared/wallet.model"
import { messageClient } from "../messaging/trpc"
import { IAccountService } from "./interface"

export class ClientAccountService implements IAccountService {
  constructor() {
    // TBD: Does it make sense to somehow inject the trpc client? I'm not sure, as that service would need to match the expected endpoints 1:1
  }

  async createAccount(
    networkId: string,
    type: CreateAccountType = "standard",
  ): Promise<WalletAccount> {
    // NOTE: very basic example, the account service could do more than just sending one message
    return messageClient.account.create.mutate({ networkId, type })
  }
}
