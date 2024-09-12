import { Token } from "../../../../token/__new/types/token.model"
import { parsedDefaultTokens } from "../../../../token/__new/utils"

export const tokensByNetwork: Token[] = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "sepolia-alpha",
)
