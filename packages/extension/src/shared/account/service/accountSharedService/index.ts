import { accountService } from ".."
import { httpService } from "../../../http/singleton"
import {
  multisigBaseWalletRepo,
  pendingMultisigRepo,
} from "../../../multisig/repository"
import { smartAccountService } from "../../../smartAccount"
import { walletStore } from "../../../wallet/walletStore"
import { accountRepo } from "../../store"
import { WalletAccountSharedService } from "./WalletAccountSharedService"
import { sessionStore } from "../../../session/storage"

export const accountSharedService = new WalletAccountSharedService(
  walletStore,
  accountRepo,
  sessionStore,
  multisigBaseWalletRepo,
  pendingMultisigRepo,
  httpService,
  accountService,
  smartAccountService,
)
