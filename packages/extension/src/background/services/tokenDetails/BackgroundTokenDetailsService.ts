import type { IHttpService } from "@argent/x-shared"
import urlJoin from "url-join"
import { TokenDetailsError } from "./tokenDetailsError"
import type {
  ITokensDetailsService,
  TokenGraphDataApi,
  TokenGraphInput,
} from "../../../shared/tokenDetails/interface"
import { apiTokenGraphDataSchema } from "../../../shared/tokenDetails/interface"

export class TokenDetailsService implements ITokensDetailsService {
  TOKENS_GRAPH_API_URL: string
  private readonly TOKENS_INFO_URL: string

  constructor(
    private readonly httpService: IHttpService,
    TOKENS_GRAPH_API_URL: string | undefined,
    TOKENS_GRAPH_INFO_URL: string | undefined,
  ) {
    if (!TOKENS_GRAPH_API_URL) {
      throw new TokenDetailsError({ code: "TOKENS_DETAILS_API_URL" })
    }
    if (!TOKENS_GRAPH_INFO_URL) {
      throw new TokenDetailsError({ code: "TOKENS_GRAPH_INFO_URL" })
    }
    this.TOKENS_GRAPH_API_URL = TOKENS_GRAPH_API_URL
    this.TOKENS_INFO_URL = TOKENS_GRAPH_INFO_URL
  }

  async fetchTokenGraph({
    tokenAddress,
    currency,
    timeFrame,
    chain,
  }: TokenGraphInput): Promise<TokenGraphDataApi | undefined> {
    const endpoint = urlJoin(
      this.TOKENS_GRAPH_API_URL,
      tokenAddress,
      `?timeframe=${timeFrame}&currency=${currency}&chain=${chain}`,
    )
    const response = await this.httpService.get<TokenGraphDataApi>(endpoint)
    const parsedResponse = apiTokenGraphDataSchema.safeParse(response)
    if (!parsedResponse.success) {
      return
    }

    return parsedResponse.data
  }
}
