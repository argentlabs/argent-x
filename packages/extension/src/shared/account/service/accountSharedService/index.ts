import { accountService } from ".."
import { httpService } from "../../../http/singleton"
import {
  multisigBaseWalletRepo,
  pendingMultisigRepo,
} from "../../../multisig/repository"
import { walletStore } from "../../../wallet/walletStore"
import { accountRepo } from "../../store"
import { sessionRepo } from "../../store/session"
import { WalletAccountSharedService } from "./WalletAccountSharedService"

export const accountSharedService = new WalletAccountSharedService(
  walletStore,
  accountRepo,
  sessionRepo,
  multisigBaseWalletRepo,
  pendingMultisigRepo,
  httpService,
  accountService,
)
