import {
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
} from "../../../api/constants"
import { httpService } from "../../../http/singleton"
import { networkService } from "../../../network/service"
import { tokenRepo } from "../repository/token"
import { tokenBalanceRepo } from "../repository/tokenBalance"
import { tokenInfoStore } from "../repository/tokenInfo"
import { tokenPriceRepo } from "../repository/tokenPrice"
import { TokenService } from "./implementation"

export const tokenService = new TokenService(
  networkService,
  tokenRepo,
  tokenBalanceRepo,
  tokenPriceRepo,
  tokenInfoStore,
  httpService,
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
)
