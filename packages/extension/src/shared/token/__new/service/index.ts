import {
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
  ARGENT_API_TOKENS_REPORT_SPAM_URL,
} from "../../../api/constants"
import { httpService } from "../../../http/singleton"
import { networkService } from "../../../network/service"
import { TokenService } from "./TokenService"
import { argentDb } from "../../../idb/argentDb"

export const tokenService = new TokenService(
  networkService,
  argentDb,
  httpService,
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
  ARGENT_API_TOKENS_REPORT_SPAM_URL,
)
