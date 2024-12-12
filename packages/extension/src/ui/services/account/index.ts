import { accountRepo } from "../../../shared/account/store"
import { multisigBaseWalletRepo } from "../../../shared/multisig/repository"
import { settingsStore } from "../../../shared/settings"
import { walletStore } from "../../../shared/wallet/walletStore"
import { multisigService } from "../multisig"
import { ClientAccountService } from "./ClientAccountService"

export const clientAccountService = new ClientAccountService(
  accountRepo,
  walletStore,
  multisigBaseWalletRepo,
  multisigService,
  settingsStore,
)
