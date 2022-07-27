import { sendMessage } from "./messageActions"

export const disconnectAccount = async () => {
  sendMessage({ type: "DISCONNECT_ACCOUNT" })
}
