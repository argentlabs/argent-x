/**
 * AccountsByHost
 * {
 *   "foo.xyz": [
 *     "0xabc..."
 *     "0xdef..."
 *   ]
 * }
 */

import { sendMessage, waitForMessage } from "./messages"

export type AccountsByHost = Record<string, string[]>

export interface IHostAndAccount {
  host: string
  accountAddress?: string | null
}

export interface IPreAuthorizations {
  allAccounts: string[]
  accountsByHost: AccountsByHost
}

export const getPreAuthorizations = async () => {
  await sendMessage({ type: "GET_PRE_AUTHORIZATIONS" })
  const preAuthorizations = await waitForMessage("GET_PRE_AUTHORIZATIONS_RES")
  return preAuthorizations
}

export const resetPreAuthorizations = async () => {
  await sendMessage({ type: "RESET_PREAUTHORIZATIONS" })
  await waitForMessage("RESET_PREAUTHORIZATIONS_RES")
}

export const removePreAuthorization = async (data: IHostAndAccount) => {
  sendMessage({ type: "REMOVE_PREAUTHORIZATION", data })
  await waitForMessage("REMOVE_PREAUTHORIZATION_RES")
}
