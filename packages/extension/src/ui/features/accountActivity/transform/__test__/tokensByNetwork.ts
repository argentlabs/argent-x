import { Token } from "../../../../../shared/token/type"
import { parsedDefaultTokens } from "../../../../../shared/token/utils"

export const tokensByNetwork: Token[] = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "goerli-alpha",
)
