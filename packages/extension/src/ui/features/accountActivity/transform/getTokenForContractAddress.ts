import { isEqualAddress } from "@argent/x-shared"
import { Token } from "../../../../shared/token/__new/types/token.model"
import { parsedDefaultTokens } from "../../../../shared/token/__new/utils"

export const getTokenForContractAddress = (
  contractAddress: string,
  tokensByNetwork: Token[] = parsedDefaultTokens,
) => {
  return tokensByNetwork.find(({ address }) =>
    isEqualAddress(address, contractAddress),
  )
}
