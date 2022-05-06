import { validateAndParseAddress } from "starknet"

import { Token } from "../shared/token"
import { Storage } from "./storage"

const tokenStore = new Storage<{
  tokens: Token[]
}>({ tokens: [] }, "tokens")

const validateToken = (token: Partial<Token>): token is Token => {
  try {
    if (
      !token.address ||
      !token.networkId ||
      !token.name ||
      !token.symbol ||
      !token.decimals
    ) {
      throw Error("token is missing required field")
    }
    validateAndParseAddress(token.address)
    return true
  } catch {
    return false
  }
}

export const getTokens = async (): Promise<Token[]> => {
  return tokenStore.getItem("tokens")
}

export const hasToken = async (address: Token["address"]): Promise<boolean> => {
  const tokens = await getTokens()
  return tokens.some((token) => token.address === address)
}

type TokenMutationResult =
  | { success: true; tokens: Token[] }
  | { success: false; tokens?: never }

export const addToken = async (token: Token): Promise<TokenMutationResult> => {
  if (!validateToken(token)) {
    throw new Error("Invalid token")
  }
  const tokens = await tokenStore.getItem("tokens")
  if (tokens.find(({ address }) => address === token.address)) {
    return { success: false }
  }
  tokens.push(token)
  await tokenStore.setItem("tokens", tokens)
  return { success: true, tokens }
}

export const removeToken = async (
  tokenAddress: Token["address"],
): Promise<TokenMutationResult> => {
  const tokens = await tokenStore.getItem("tokens")
  const index = tokens.findIndex(({ address }) => address === tokenAddress)
  if (index === -1) {
    return { success: false }
  }
  tokens.splice(index, 1)
  await tokenStore.setItem("tokens", tokens)
  return { success: true, tokens }
}
