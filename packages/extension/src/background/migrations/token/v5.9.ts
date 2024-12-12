import { isEmpty } from "lodash-es"
import { tokenService } from "../../../shared/token/__new/service"
import type { Token } from "../../../shared/token/__new/types/token.model"
import {
  equalToken,
  parsedDefaultTokens,
} from "../../../shared/token/__new/utils"
import { tokenStore } from "../../../shared/token/__deprecated/storage"

export async function runV59TokenMigration() {
  const oldTokens = await tokenStore.get()

  // Only migrate tokens that are not default tokens
  const tokensToMigrate: Token[] = oldTokens
    .filter(
      (token) =>
        !parsedDefaultTokens.some((defaultToken) =>
          equalToken(token, defaultToken),
        ),
    )
    .map((token) => ({
      name: token.name,
      address: token.address,
      networkId: token.networkId,
      symbol: token.symbol,
      decimals: token.decimals,
      custom: true,
      iconUrl: token.image,
      showAlways: token.showAlways,
    }))

  if (isEmpty(tokensToMigrate)) {
    return
  }

  return await tokenService.addToken(tokensToMigrate)
}
