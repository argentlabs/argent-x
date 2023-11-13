import browser from "webextension-polyfill"
import { StarknetMethodArgumentsSchemas } from "@argent/x-window"
import { MessageType } from "../../shared/messages"
import { handleMessage } from "./handle"

export const addMessageListeners = () => {
  browser.runtime.onConnect.addListener((port) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    port.onMessage.addListener(async (msg: MessageType, port) => {
      const sender = port.sender
      if (sender) {
        switch (msg.type) {
          case "EXECUTE_TRANSACTION": {
            const [transactions, abis, transactionsDetail] =
              await StarknetMethodArgumentsSchemas.execute.parseAsync([
                msg.data.transactions,
                msg.data.abis,
                msg.data.transactionsDetail,
              ])
            return handleMessage(
              [
                { ...msg, data: { transactions, abis, transactionsDetail } },
                sender,
              ],
              port,
            )
          }

          case "SIGN_MESSAGE": {
            const [typedData] =
              await StarknetMethodArgumentsSchemas.signMessage.parseAsync([
                msg.data.typedData,
              ])
            return handleMessage(
              [
                { ...msg, data: { typedData, options: msg.data.options } },
                sender,
              ],
              port,
            )
          }

          default:
            return handleMessage([msg, sender], port)
        }
      }
    })
  })
}
