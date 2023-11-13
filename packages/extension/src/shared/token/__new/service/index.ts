import {
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
} from "../../../api/constants"
import { networkService } from "../../../network/service"
import { tokenRepo } from "../repository/token"
import { tokenBalanceRepo } from "../repository/tokenBalance"
import { tokenPriceRepo } from "../repository/tokenPrice"
import { TokenService } from "./implementation"

export const tokenService = new TokenService(
  networkService,
  tokenRepo,
  tokenBalanceRepo,
  tokenPriceRepo,
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
)
