import { ARGENT_SWAP_BASE_URL } from "../../api/constants"
import { networkService } from "../../network/service"
import { tokenService } from "../../token/__new/service"
import { SharedSwapService } from "./implementation"
import { httpService } from "../../http/singleton"

export const sharedSwapService = new SharedSwapService(
  tokenService,
  networkService,
  httpService,
  ARGENT_SWAP_BASE_URL,
)
