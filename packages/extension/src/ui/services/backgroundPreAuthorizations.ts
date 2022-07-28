import { sendMessage, waitForMessage } from "../../shared/messages"

export const getPreAuthorizations = async () => {
  sendMessage({ type: "GET_PRE_AUTHORIZATIONS" })
  return waitForMessage("GET_PRE_AUTHORIZATIONS_RES")
}
