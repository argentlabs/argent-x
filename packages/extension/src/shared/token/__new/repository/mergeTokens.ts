import type { Token } from "../types/token.model"
import { equalToken, parsedDefaultTokens } from "../utils"
import { mergeArrayStableWith } from "../../../storage/__new/base"
import type { ApiTokenInfo } from "@argent/x-shared"

export function mergeTokens(oldValue: Token, newValue?: ApiTokenInfo | Token) {
  if (!newValue) {
    return oldValue
  }
  const merged = {
    ...oldValue,
    ...newValue,
  }
  /** if b is missing tags, remove from a */
  if (oldValue.tags && !newValue.tags) {
    delete merged.tags
  }
  return merged
}

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
