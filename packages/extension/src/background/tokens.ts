import { validateAndParseAddress } from "starknet"

import { Token } from "../shared/token"
import { Storage } from "./storage"

const tokenStore = new Storage<{
  tokens: Token[]
}>({ tokens: [] }, "tokens")

const validateToken = (token: Partial<Token>): token is Token => {
  if (!token.address) {
    return false
  }
  try {
    validateAndParseAddress(token.address)
  } catch (e) {
    return false
  }
  if (!token.networkId) {
    return false
  }
  if (!token.name) {
    return false
  }
  if (!token.symbol) {
    return false
  }
  if (!token.decimals) {
    return false
  }
  return true
}

export const getTokens = async (): Promise<Token[]> => {
  return tokenStore.getItem("tokens")
}

export const hasToken = async (address: Token["address"]): Promise<boolean> => {
  const tokens = await getTokens()
  return tokens.some((token) => token.address === address)
}

type MutateTokenRes =
  | { success: true; tokens: Token[] }
  | { success: false; tokens?: never }

export const addToken = async (token: Token): Promise<MutateTokenRes> => {
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
): Promise<MutateTokenRes> => {
  const tokens = await tokenStore.getItem("tokens")
  const index = tokens.findIndex(({ address }) => address === tokenAddress)
  if (index === -1) {
    return { success: false }
  }
  tokens.splice(index, 1)
  await tokenStore.setItem("tokens", tokens)
  return { success: true, tokens }
}
