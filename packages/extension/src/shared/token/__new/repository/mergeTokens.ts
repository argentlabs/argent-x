import type { Token } from "../types/token.model"
import { equalToken, parsedDefaultTokens } from "../utils"
import { mergeArrayStableWith } from "../../../storage/__new/base"

export function mergeTokens(newValue: Token, oldValue?: Token) {
  if (!oldValue) {
    return newValue
  }
  const merged = { ...oldValue, ...newValue }

  /** if b is missing tags, remove from a */
  if (oldValue.tags && !newValue.tags) {
    delete merged.tags
  }

  if (oldValue.pricingId && !newValue.pricingId) {
    delete merged.pricingId
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
