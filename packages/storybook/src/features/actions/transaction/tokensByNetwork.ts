import { Token } from "@argent-x/extension/src/shared/token/type"
import { parsedDefaultTokens } from "@argent-x/extension/src/shared/token/utils"

export const tokensByNetwork: Token[] = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "goerli-alpha",
)
