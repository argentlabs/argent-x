import { ARGENT_MULTISIG_URL } from "../../../api/constants"
import { MultisigBackendService } from "./MultisigBackendService"

export const argentMultisigBackendService = new MultisigBackendService(
  ARGENT_MULTISIG_URL,
)
