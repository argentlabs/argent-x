import { accountSharedService } from "../../shared/account/service"
import { argentMultisigBackendService } from "../../shared/multisig/service/backend"
import { accountStarknetService } from "../walletSingleton"
import { NonceManagementService } from "./NonceManagementService"
import { nonceStore } from "./store"

export const nonceManagementService = new NonceManagementService(
  nonceStore,
  accountSharedService,
  accountStarknetService,
  argentMultisigBackendService,
)
