import { sendMessage, waitForMessage } from "../../shared/messages"
import { Token } from "../../shared/token"

export const getTokens = async () => {
  sendMessage({ type: "GET_TOKENS" })
  return waitForMessage("GET_TOKENS_RES")
}

export const removeToken = async (address: string) => {
  sendMessage({ type: "REMOVE_TOKEN", data: address })
  return waitForMessage("REMOVE_TOKEN_RES")
}

export const addToken = async (token: Token) => {
  sendMessage({ type: "ADD_TOKEN", data: token })
  return waitForMessage("ADD_TOKEN_RES")
}
