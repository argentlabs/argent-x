import { accountService } from "../../account/service"
import { networkService } from "../../network/service"
import { tokenService } from "../../token/__new/service"
import { feeTokenPreferenceStore } from "../repository/preference"
import { FeeTokenService } from "./implementation"

export const feeTokenService = new FeeTokenService(
  tokenService,
  accountService,
  networkService,
  feeTokenPreferenceStore,
)
