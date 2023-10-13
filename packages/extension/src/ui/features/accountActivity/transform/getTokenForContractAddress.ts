import { Token } from "../../../../shared/token/__new/types/token.model"
import { parsedDefaultTokens } from "../../../../shared/token/__new/utils"
import { isEqualAddress } from "../../../services/addresses"

export const getTokenForContractAddress = (
  contractAddress: string,
  tokensByNetwork: Token[] = parsedDefaultTokens,
) => {
  return tokensByNetwork.find(({ address }) =>
    isEqualAddress(address, contractAddress),
  )
}
