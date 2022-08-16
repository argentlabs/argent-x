import { Token } from "../../../../shared/token/type"
import { parsedDefaultTokens } from "../../../../shared/token/utils"
import { isEqualAddress } from "../../../services/addresses"

export const getTokenForContractAddress = (
  contractAddress: string,
  tokensByNetwork: Token[] = parsedDefaultTokens,
) => {
  return tokensByNetwork.find(({ address }) =>
    isEqualAddress(address, contractAddress),
  )
}
