import { argentMultisigBackendService } from "../../multisig/service/backend"
import { networkService } from "../../network/service"
import { LedgerSharedService } from "./LedgerSharedService"

export const ledgerSharedService = new LedgerSharedService(
  networkService,
  argentMultisigBackendService,
)
