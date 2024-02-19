import browser from "webextension-polyfill"

import { ChromeRepository } from "../../../storage/__new/chrome"
import type { IRepository } from "../../../storage/__new/interface"
import type { Token } from "../types/token.model"
import { equalToken, parsedDefaultTokens } from "../utils"
import { mergeTokens, mergeTokensWithDefaults } from "./mergeTokens"

export type ITokenRepository = IRepository<Token>

export const tokenRepo: ITokenRepository = new ChromeRepository<Token>(
  browser,
  {
    areaName: "local",
    namespace: "core:tokens",
    compare: equalToken,
    merge: mergeTokens,
    defaults: parsedDefaultTokens,
    deserialize(repoTokens: Token[]): Token[] {
      // overwrite the stored values for the default tokens with the default values
      return mergeTokensWithDefaults(repoTokens, parsedDefaultTokens)
    },
  },
)
