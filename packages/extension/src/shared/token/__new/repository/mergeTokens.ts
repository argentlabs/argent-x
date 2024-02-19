import type { Token } from "../types/token.model"
import { equalToken, parsedDefaultTokens } from "../utils"
import { mergeArrayStableWith } from "../../../storage/__new/base"

export const mergeTokens = (oldValue: Token, newValue: Token) => ({
  ...oldValue,
  ...newValue,
})

export const mergeTokensWithDefaults = (
  tokens: Token[],
  defaultTokens: Token[] = parsedDefaultTokens,
) => {
  const repoTokensWithDefaults = mergeArrayStableWith(tokens, defaultTokens, {
    compareFn: equalToken,
    mergeFn: mergeTokens,
    insertMode: "unshift",
  })
  return repoTokensWithDefaults
}
