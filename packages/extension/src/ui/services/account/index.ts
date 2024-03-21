import { accountRepo } from "../../../shared/account/store"
import { settingsStore } from "../../../shared/settings"
import { multisigService } from "../multisig"
import { ClientAccountService } from "./implementation"

// export interfaces
export type { IAccountService } from "./interface"

// export singletons
export const clientAccountService = new ClientAccountService(
  accountRepo,
  multisigService,
  settingsStore,
)
