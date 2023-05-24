import { accountStore } from "../shared/account/store"
import {
  multisigBaseWalletStore,
  pendingMultisigStore,
} from "../shared/multisig/store"
import { getNetwork } from "../shared/network"
import { old_walletStore } from "../shared/wallet/walletStore"
import { loadContracts } from "./accounts"
import { Wallet, sessionStore } from "./wallet"

export const walletSingleton = new Wallet(
  old_walletStore,
  accountStore,
  sessionStore,
  multisigBaseWalletStore,
  pendingMultisigStore,
  loadContracts,
  getNetwork,
)
