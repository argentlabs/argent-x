import browser from "webextension-polyfill"
import { ChromeRepository } from "../../../storage/__new/chrome"
import { IRepository } from "../../../storage/__new/interface"
import { BaseToken, Token } from "../types/token.model"
import { equalToken, parsedDefaultTokens } from "../utils"

export type ITokenRepository = IRepository<Token>

export const tokenRepo: ITokenRepository = new ChromeRepository<Token>(
  browser,
  {
    areaName: "local",
    namespace: "core:tokens",
    compare: (a: BaseToken, b: BaseToken) => equalToken(a, b),
    defaults: parsedDefaultTokens,
  },
)
