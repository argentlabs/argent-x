import { Token } from "@argent-x/extension/src/shared/token/type"
import {
  getFeeToken,
  parsedDefaultTokens,
} from "@argent-x/extension/src/shared/token/utils"

export const tokensByNetwork: Token[] = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "goerli-alpha",
)

export const feeToken = getFeeToken("goerli-alpha") as Token
