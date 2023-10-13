import { Token } from "../../../../../shared/token/__new/types/token.model"
import { parsedDefaultTokens } from "../../../../../shared/token/__new/utils"

export const tokensByNetwork: Token[] = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "goerli-alpha",
)
