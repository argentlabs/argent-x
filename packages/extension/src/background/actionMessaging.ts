import { number } from "starknet"

import { ActionMessage } from "../shared/messages/ActionMessage"
import { analytics } from "./analytics"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { getNonce, increaseStoredNonce } from "./nonce"
import { openUi } from "./openUi"
import { preAuthorize } from "./preAuthorizations"
import { nameTransaction } from "./transactions/transactionNames"

export const handleActionMessage: HandleMessage<ActionMessage> = async ({
  msg,
  background: { wallet, transactionTracker, actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_ACTIONS": {
      const actions = await actionQueue.getAll()
      return sendToTabAndUi({
        type: "GET_ACTIONS_RES",
        data: actions,
      })
    }

    case "APPROVE_ACTION": {
      const { actionHash } = msg.data
      const action = await actionQueue.remove(actionHash)
      if (!action) {
        throw new Error("Action not found")
      }
      switch (action.type) {
        case "CONNECT_DAPP": {
          const { host } = action.payload
          const selectedAccount = await wallet.getSelectedAccount()

          analytics.track("preauthorizeDapp", {
            host,
          })
          await preAuthorize(host)

          if (selectedAccount) {
            return sendToTabAndUi({
              type: "CONNECT_DAPP_RES",
              data: selectedAccount,
            })
          }
          return openUi()
        }

        case "TRANSACTION": {
          try {
            const { transactions, abis, transactionsDetail } = action.payload
            if (!wallet.isSessionOpen()) {
              throw Error("you need an open session")
            }
            const selectedAccount = await wallet.getSelectedAccount()
            const starknetAccount = await wallet.getSelectedStarknetAccount()
            if (!selectedAccount) {
              throw Error("no accounts")
            }

            // if nonce doesnt get provided by the UI, we can use the stored nonce to allow transaction queueing
            const nonceWasProvidedByUI = transactionsDetail?.nonce !== undefined // nonce can be a number of 0 therefore we need to check for undefined
            const nonce = nonceWasProvidedByUI
              ? number.toHex(number.toBN(transactionsDetail?.nonce || 0))
              : await getNonce(starknetAccount)

            // FIXME: mainnet hack to dont pay fees as long as possible
            const { maxFee } =
              selectedAccount.network.id === "mainnet-alpha"
                ? { maxFee: "0x0" }
                : action.override || {}

            const maxFeeOverrideExists = maxFee !== undefined && maxFee !== null

            const transaction = await starknetAccount.execute(
              transactions,
              abis,
              {
                ...transactionsDetail,
                nonce,
                // For now we want to set the maxFee to 0 in case the user has not provided a maxFee. This will change with the next release. The default behavior in starknet.js is to estimate the fee, so we need to pass 0 explicitly.
                // TODO: remove in next release
                maxFee: maxFeeOverrideExists ? maxFee : 0,
              },
            )

            transactionTracker.add({
              hash: transaction.transaction_hash,
              account: selectedAccount,
              meta: nameTransaction(transactions, abis),
            })

            if (!nonceWasProvidedByUI) {
              increaseStoredNonce(selectedAccount.address)
            }

            return sendToTabAndUi({
              type: "TRANSACTION_SUBMITTED",
              data: {
                txHash: transaction.transaction_hash,
                actionHash,
              },
            })
          } catch (error: any) {
            return sendToTabAndUi({
              type: "TRANSACTION_FAILED",
              data: { actionHash, error: `${error}` },
            })
          }
        }

        case "SIGN": {
          const typedData = action.payload
          if (!wallet.isSessionOpen()) {
            throw Error("you need an open session")
          }
          const starknetAccount = await wallet.getSelectedStarknetAccount()

          const [r, s] = await starknetAccount.signMessage(typedData)

          return sendToTabAndUi({
            type: "SIGNATURE_SUCCESS",
            data: {
              r: r.toString(),
              s: s.toString(),
              actionHash,
            },
          })
        }

        case "REQUEST_TOKEN": {
          return sendToTabAndUi({
            type: "APPROVE_REQUEST_TOKEN",
            data: {
              actionHash,
            },
          })
        }

        case "REQUEST_ADD_CUSTOM_NETWORK": {
          return sendToTabAndUi({
            type: "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
            data: {
              actionHash,
            },
          })
        }

        case "REQUEST_SWITCH_CUSTOM_NETWORK": {
          return sendToTabAndUi({
            type: "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
            data: {
              actionHash,
            },
          })
        }

        default:
          return
      }
    }

    case "REJECT_ACTION": {
      const { actionHash } = msg.data
      const action = await actionQueue.remove(actionHash)
      if (!action) {
        throw new Error("Action not found")
      }
      switch (action.type) {
        case "CONNECT_DAPP": {
          return sendToTabAndUi({
            type: "REJECT_PREAUTHORIZATION",
            data: {
              host: action.payload.host,
              actionHash,
            },
          })
        }
        case "TRANSACTION": {
          return sendToTabAndUi({
            type: "TRANSACTION_FAILED",
            data: {
              actionHash,
            },
          })
        }
        case "SIGN": {
          return sendToTabAndUi({
            type: "SIGNATURE_FAILURE",
            data: {
              actionHash,
            },
          })
        }
        case "REQUEST_TOKEN": {
          return sendToTabAndUi({
            type: "REJECT_REQUEST_TOKEN",
            data: {
              actionHash,
            },
          })
        }

        case "REQUEST_ADD_CUSTOM_NETWORK": {
          return sendToTabAndUi({
            type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
            data: {
              actionHash,
            },
          })
        }

        case "REQUEST_SWITCH_CUSTOM_NETWORK": {
          return sendToTabAndUi({
            type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
            data: {
              actionHash,
            },
          })
        }

        default:
          return
      }
    }

    case "SIGN_MESSAGE": {
      const { meta } = await actionQueue.push({
        type: "SIGN",
        payload: msg.data,
      })

      return sendToTabAndUi({
        type: "SIGN_MESSAGE_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "SIGNATURE_FAILURE": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
