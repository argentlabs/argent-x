import {
  extensionOrigin,
  getCurrentTabOrigin,
  getOtherTabsOrigins,
} from "../../../../shared/browser/origin"
import {
  accountIdSchema,
  isNetworkOnlyPlaceholderAccount,
  networkOnlyPlaceholderAccountSchema,
} from "../../../../shared/wallet.model"
import { respondToHost } from "../../../respond"
import { openSessionMiddleware } from "../../middleware/session"
import { connectDapp } from "../dappMessaging/connectDapp"
import { extensionOnlyProcedure } from "../permissions"

export const selectAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(accountIdSchema.or(networkOnlyPlaceholderAccountSchema))
  .mutation(
    async ({
      input: baseWalletAccount,
      ctx: {
        services: {
          wallet,
          preAuthorizationService,
          backgroundUIService,
          uiService,
          actionService,
        },
      },
    }) => {
      const account = await wallet.selectAccount(baseWalletAccount)
      if (isNetworkOnlyPlaceholderAccount(account)) {
        return
      }
      const currentTabOrigin = await getCurrentTabOrigin()
      const otherTabsOrigins = await getOtherTabsOrigins()

      /** handle on exiting tab */
      if (currentTabOrigin && currentTabOrigin !== extensionOrigin) {
        const hasBeenPreAuthorizedOnce =
          await preAuthorizationService.hasBeenPreAuthorizedOnce(
            currentTabOrigin,
          )
        const isPreAuthorized = await preAuthorizationService.isPreAuthorized({
          account: account,
          host: currentTabOrigin,
        })
        if (isPreAuthorized) {
          // user switched account on existing authorized dapp - let the dapp know to switch
          // `CONNECT_ACCOUNT_RES` triggers `handleConnect` inpage for this specific host, triggering dapp `accountsChanged` listeners
          void respondToHost(
            {
              type: "CONNECT_ACCOUNT_RES",
              data: account,
            },
            currentTabOrigin,
          )
        } else if (hasBeenPreAuthorizedOnce) {
          // new connection with this account, on existing authorized dapp - user must confirm
          await connectDapp({
            input: {
              origin: currentTabOrigin,
              silent: false,
            },
            backgroundUIService,
            uiService,
            actionService,
            wallet,
            preAuthorizationService,
          })
        }
      }

      /** notify other tabs */
      await Promise.all(
        otherTabsOrigins.map(async (origin) => {
          const hasBeenPreAuthorizedOnce =
            await preAuthorizationService.hasBeenPreAuthorizedOnce(origin)
          const isPreAuthorized = await preAuthorizationService.isPreAuthorized(
            {
              account: account,
              host: origin,
            },
          )
          if (isPreAuthorized) {
            // user switched account on existing authorized dapp - let the dapp know to switch
            // `CONNECT_ACCOUNT_RES` triggers `handleConnect` inpage for this specific host, triggering dapp `accountsChanged` listeners
            void respondToHost(
              {
                type: "CONNECT_ACCOUNT_RES",
                data: account,
              },
              origin,
            )
          } else if (hasBeenPreAuthorizedOnce) {
            // switched to an unauthorized account on an authorized dapp - let the dapp know to disconnect
            void respondToHost(
              {
                type: "DISCONNECT_ACCOUNT",
              },
              origin,
            )
          }
        }),
      )
    },
  )
