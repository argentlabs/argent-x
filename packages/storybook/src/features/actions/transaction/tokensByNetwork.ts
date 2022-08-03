import defaultTokens from "@argent-x/extension/src/assets/default-tokens.json"
import { TokenDetailsWithBalance } from "@argent-x/extension/src/ui/features/accountTokens/tokens.state"

/** convert to expected types and shape */
export const tokensByNetwork: TokenDetailsWithBalance[] = defaultTokens
  .filter(({ network }) => network === "goerli-alpha")
  .map((token) => {
    return {
      ...token,
      networkId: token.network,
      decimals: Number(token.decimals),
    }
  })
