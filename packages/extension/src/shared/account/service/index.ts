import { messageClient } from "../../../ui/services/messaging/trpc"
import { starknetChainService } from "../../chain/service"
import { walletStore } from "../../wallet/walletStore"
import { accountRepo } from "../store"
import { AccountService } from "./implementation"
import { multisigService } from "../../../ui/services/multisig"

export const accountService = new AccountService(
  starknetChainService,
  accountRepo,
  walletStore,
  messageClient,
  multisigService,
)
