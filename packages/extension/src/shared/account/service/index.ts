import { starknetChainService } from "../../chain/service"
import {
  multisigBaseWalletRepo,
  pendingMultisigRepo,
} from "../../multisig/repository"
import { walletStore } from "../../wallet/walletStore"
import { accountRepo } from "../store"
import { sessionRepo } from "../store/session"
import { AccountService } from "./implementation"
import { WalletAccountSharedService } from "./shared.service"

export const accountService = new AccountService(
  starknetChainService,
  accountRepo,
)

export const accountSharedService = new WalletAccountSharedService(
  walletStore,
  accountRepo,
  sessionRepo,
  multisigBaseWalletRepo,
  pendingMultisigRepo,
)
