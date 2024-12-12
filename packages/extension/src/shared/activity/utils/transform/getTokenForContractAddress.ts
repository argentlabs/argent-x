import { isEqualAddress } from "@argent/x-shared"
import type { Token } from "../../../token/__new/types/token.model"
import { parsedDefaultTokens } from "../../../token/__new/utils"

export const getTokenForContractAddress = (
  contractAddress: string,
  tokensByNetwork: Token[] = parsedDefaultTokens,
) => {
  return tokensByNetwork.find(({ address }) =>
    isEqualAddress(address, contractAddress),
  )
}
