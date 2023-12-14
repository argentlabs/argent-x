import { accountRepo } from "../../../shared/account/store"
import { multisigService } from "../multisig"
import { ClientAccountService } from "./implementation"

// export interfaces
export type { IAccountService } from "./interface"

// export singletons
export const clientAccountService = new ClientAccountService(
  accountRepo,
  multisigService,
)
