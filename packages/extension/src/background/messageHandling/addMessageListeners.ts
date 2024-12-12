import browser from "webextension-polyfill"
import { StarknetMethodArgumentsSchemas } from "@argent/x-window"
import type { MessageType } from "../../shared/messages"
import { handleMessage } from "./handle"
import {
  isSessionKeyTypedData,
  sessionKeyMessageSchema,
} from "../../shared/sessionKeys/schema"
import { getOriginFromSender } from "../../shared/messages/getOriginFromSender"
import { knownDappsService } from "../../shared/knownDapps/index"
import { isEmpty } from "lodash-es"
import { isLocalhost } from "../../shared/messages/isLocalhost"

export const addMessageListeners = () => {
  const initialUrls = new Map<number, string>() // tabId -> url

  browser.runtime.onConnect.addListener((port) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    port.onMessage.addListener(async (msg: MessageType, port) => {
      const sender = port.sender

      if (sender) {
        if (sender.tab?.id) {
          // Replace sender.origin with the initial URL from the map to handle redirects
          sender.origin = initialUrls.get(sender.tab?.id) || sender.origin
        }

        switch (msg.type) {
          case "EXECUTE_TRANSACTION": {
            const [transactions, transactionsDetail] =
              await StarknetMethodArgumentsSchemas.execute.parseAsync([
                msg.data.transactions,
                msg.data.transactionsDetail,
              ])
            return handleMessage(
              [{ ...msg, data: { transactions, transactionsDetail } }, sender],
              port,
            )
          }

          case "SIGN_MESSAGE": {
            /** validate the message to ensure it is a valid StarknetTypedData */
            const [typedData] =
              await StarknetMethodArgumentsSchemas.signMessage.parseAsync([
                msg.data.typedData,
              ])
            /** if it is potentially session key then further validate the message payload and domain */
            if (isSessionKeyTypedData(typedData)) {
              const host = getOriginFromSender(sender)

              // Always allow localhost session key signing
              if (!isLocalhost(host)) {
                const knownDappData =
                  await knownDappsService.getDappByHost(host)

                if (isEmpty(knownDappData?.sessionConfig)) {
                  throw new Error(
                    `The origin is not whitelisted for session keys`,
                  )
                }
              }

              await sessionKeyMessageSchema.parseAsync(typedData.message)
            }
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

  if (browser.webNavigation?.onBeforeNavigate) {
    // Store the initial URL of the tab, to detect redirects
    const onBeforeNavigateListener = (details: any) => {
      // We are saving the URL only if the navigation is happening in the top-level frame of a tab. There can only be navigation within a nested frame inside the webpage, such as an iframe
      if (details.frameType === "outermost_frame") {
        initialUrls.set(details.tabId, details.url)
      }
    }
    if (
      !browser.webNavigation.onBeforeNavigate.hasListener(
        onBeforeNavigateListener,
      )
    ) {
      browser.webNavigation.onBeforeNavigate.addListener(
        onBeforeNavigateListener,
        {
          url: [{ urlMatches: ".*" }],
        },
      )
    }
  }
}
