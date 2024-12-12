import {
  ARGENT_TOKENS_GRAPH_API_URL,
  ARGENT_TOKENS_INFO_URL,
} from "../../../shared/api/constants"
import { httpService } from "../../../shared/http/singleton"
import { TokenDetailsService } from "./BackgroundTokenDetailsService"

export const tokenDetailsService = new TokenDetailsService(
  httpService,
  ARGENT_TOKENS_GRAPH_API_URL,
  ARGENT_TOKENS_INFO_URL,
)
