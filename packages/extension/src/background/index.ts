import { compactDecrypt } from "jose"
import { encode } from "starknet"

import { ActionItem } from "../shared/actionQueue"
import { messageStream } from "../shared/messages"
import { MessageType } from "../shared/MessageType"
import { getProvider } from "../shared/networks"
import { getQueue } from "./actionQueue"
import {
  addTab,
  hasTab,
  sendMessageToActiveTabs,
  sendMessageToActiveTabsAndUi,
  sendMessageToUi,
} from "./activeTabs"
import { getKeyPair } from "./keys/communication"
import {
  createAccount,
  deleteAccount,
  downloadBackupFile,
  existsL1,
  getWallets,
  importKeystore,
  isUnlocked,
  lockWallet,
  resetAll,
  validatePassword,
} from "./keys/l1"
import { getNonce, increaseStoredNonce, resetStoredNonce } from "./nonce"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "./notification"
import { openUi } from "./openUi"
import { selectedWalletStore } from "./selectedWallet"
import { getSigner } from "./signer"
import { setToStorage } from "./storage"
import { TransactionTracker, getTransactionStatus } from "./trackTransactions"
import { addToWhitelist, isOnWhitelist } from "./whitelist"

;(async () => {
  const { privateKey, publicKeyJwk } = await getKeyPair()

  const transactionTracker = new TransactionTracker(
    async (transactions) => {
      if (transactions.length > 0) {
        sendMessageToUi({
          type: "TRANSACTION_UPDATES",
          data: transactions,
        })

        for (const { hash, status, walletAddress, meta } of transactions) {
          if (
            (status === "ACCEPTED_ON_L2" || status === "REJECTED") &&
            !(await hasShownNotification(hash))
          ) {
            addToAlreadyShown(hash)
            sentTransactionNotification(hash, status, meta)
            if (walletAddress && status === "ACCEPTED_ON_L2") {
              sendMessageToUi({
                type: "TRANSACTION_SUCCESS",
                data: {
                  hash,
                  status,
                  walletAddress,
                  meta,
                },
              })
            }
          }
          // on error remove stored (increased) nonce
          if (walletAddress && status === "REJECTED") {
            resetStoredNonce(walletAddress)
          }
        }
      }
    },

    30 * 1000,
  )

  messageStream.subscribe(async ([msg, sender]) => {
    const sendToTabAndUi = async (msg: MessageType) => {
      sendMessageToActiveTabsAndUi(msg, [sender.tab?.id])
    }
    // forward UI messages to rest of the tabs
    if (!hasTab(sender.tab?.id)) {
      sendMessageToActiveTabs(msg)
    }

    const actionQueue = await getQueue<ActionItem>({
      onUpdate: (actions) => {
        sendToTabAndUi({
          type: "ACTIONS_QUEUE_UPDATE",
          data: { actions },
        })
      },
    })

    switch (msg.type) {
      case "OPEN_UI": {
        return openUi()
      }

      case "GET_TRANSACTIONS": {
        const transactions = transactionTracker.getAllTransactions()

        return sendToTabAndUi({
          type: "GET_TRANSACTIONS_RES",
          data: transactions,
        })
      }

      case "GET_TRANSACTION": {
        const cached = transactionTracker.getTransactionStatus(msg.data.hash)
        if (cached) {
          return sendToTabAndUi({
            type: "GET_TRANSACTION_RES",
            data: cached,
          })
        }

        const provider = getProvider(msg.data.network)
        const fetchedStatus = await getTransactionStatus(
          provider,
          msg.data.hash,
        )
        return sendToTabAndUi({
          type: "GET_TRANSACTION_RES",
          data: fetchedStatus,
        })
      }

      case "ADD_TRANSACTION": {
        const { meta } = await actionQueue.push({
          type: "TRANSACTION",
          payload: msg.data,
        })
        return sendToTabAndUi({
          type: "ADD_TRANSACTION_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      case "GET_ACTIONS": {
        const actions = await actionQueue.getAll()
        return sendToTabAndUi({
          type: "GET_ACTIONS_RES",
          data: actions,
        })
      }

      case "GET_SELECTED_WALLET": {
        const selectedWallet = await selectedWalletStore.getItem(
          "SELECTED_WALLET",
        )

        return sendToTabAndUi({
          type: "GET_SELECTED_WALLET_RES",
          data: selectedWallet,
        })
      }

      case "CONNECT": {
        const selectedWallet = await selectedWalletStore.getItem(
          "SELECTED_WALLET",
        )
        const isWhitelisted = await isOnWhitelist(msg.data.host)

        addTab(sender.tab?.id)

        if (!isWhitelisted) {
          await actionQueue.push({
            type: "CONNECT",
            payload: { host: msg.data.host },
          })
        }

        if (isWhitelisted && selectedWallet.address) {
          return sendToTabAndUi({ type: "CONNECT_RES", data: selectedWallet })
        }

        return openUi()
      }

      case "WALLET_CONNECTED": {
        return selectedWalletStore.setItem("SELECTED_WALLET", msg.data)
      }

      case "APPROVE_ACTION": {
        const { actionHash } = msg.data
        const action = await actionQueue.remove(actionHash)
        if (!action) {
          throw new Error("Action not found")
        }
        switch (action.type) {
          case "CONNECT": {
            const { host } = action.payload
            const selectedWallet = await selectedWalletStore.getItem(
              "SELECTED_WALLET",
            )

            await addToWhitelist(host)

            if (selectedWallet) {
              return sendToTabAndUi({
                type: "CONNECT_RES",
                data: selectedWallet,
              })
            }
            return openUi()
          }

          case "TRANSACTION": {
            const transaction = action.payload
            if (!isUnlocked()) {
              throw Error("you need an open session")
            }
            const selectedWallet = await selectedWalletStore.getItem(
              "SELECTED_WALLET",
            )
            const signer = await getSigner(selectedWallet)

            try {
              const nonce = await getNonce(signer)

              const tx = await signer.addTransaction({ ...transaction, nonce })

              increaseStoredNonce(signer.address)
              transactionTracker.trackTransaction(
                tx.transaction_hash,
                selectedWallet,
              )

              return sendToTabAndUi({
                type: "SUBMITTED_TX",
                data: {
                  txHash: tx.transaction_hash,
                  actionHash,
                },
              })
            } catch (error: any) {
              return sendToTabAndUi({
                type: "FAILED_TX",
                data: { actionHash, error: `${error}` },
              })
            }
          }

          case "SIGN": {
            const typedData = action.payload
            if (!isUnlocked()) {
              throw Error("you need an open session")
            }
            const selectedWallet = await selectedWalletStore.getItem(
              "SELECTED_WALLET",
            )
            const signer = await getSigner(selectedWallet)

            const [r, s] = await signer.signMessage(typedData)

            return sendToTabAndUi({
              type: "SUCCESS_SIGN",
              data: {
                r: r.toString(),
                s: s.toString(),
                actionHash,
              },
            })
          }

          case "ADD_TOKEN": {
            return sendToTabAndUi({
              type: "APPROVE_ADD_TOKEN",
              data: {
                actionHash,
              },
            })
          }

          default:
            return
        }
      }

      case "ADD_TOKEN": {
        const { meta } = await actionQueue.push({
          type: "ADD_TOKEN",
          payload: msg.data,
        })
        return sendToTabAndUi({
          type: "ADD_TOKEN_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      case "REJECT_ACTION": {
        const { actionHash } = msg.data
        const action = await actionQueue.remove(actionHash)
        if (!action) {
          throw new Error("Action not found")
        }
        switch (action.type) {
          case "CONNECT": {
            return sendToTabAndUi({
              type: "REJECT_WHITELIST",
              data: {
                host: action.payload.host,
                actionHash,
              },
            })
          }
          case "TRANSACTION": {
            return sendToTabAndUi({
              type: "FAILED_TX",
              data: {
                actionHash,
              },
            })
          }
          case "SIGN": {
            return sendToTabAndUi({
              type: "FAILED_SIGN",
              data: {
                actionHash,
              },
            })
          }
          case "ADD_TOKEN": {
            return sendToTabAndUi({
              type: "REJECT_ADD_TOKEN",
              data: {
                actionHash,
              },
            })
          }
          default:
            return
        }
      }

      case "FAILED_SIGN":
      case "REJECT_WHITELIST":
      case "REJECT_ADD_TOKEN":
      case "FAILED_TX": {
        return await actionQueue.remove(msg.data.actionHash)
      }

      case "RESET_ALL": {
        return resetAll()
      }

      case "ADD_WHITELIST": {
        return actionQueue.push({
          type: "CONNECT",
          payload: { host: msg.data },
        })
      }
      case "IS_WHITELIST": {
        const valid = await isOnWhitelist(msg.data)
        return sendToTabAndUi({ type: "IS_WHITELIST_RES", data: valid })
      }
      case "RESET_WHITELIST": {
        setToStorage(`WHITELIST:APPROVED`, [])
        setToStorage(`WHITELIST:PENDING`, [])
        return
      }
      case "REQ_PUB": {
        return sendToTabAndUi({ type: "REQ_PUB_RES", data: publicKeyJwk })
      }
      case "START_SESSION": {
        const { secure, body } = msg.data
        if (secure !== true) {
          throw Error("session can only be started with encryption")
        }
        const { plaintext } = await compactDecrypt(body, privateKey)
        const sessionPassword = encode.arrayBufferToString(plaintext)
        if (await validatePassword(sessionPassword)) {
          sendToTabAndUi({ type: "START_SESSION_RES" })
        }
        return sendToTabAndUi({ type: "START_SESSION_REJ" })
      }
      case "HAS_SESSION": {
        return sendToTabAndUi({
          type: "HAS_SESSION_RES",
          data: isUnlocked(),
        })
      }
      case "STOP_SESSION": {
        return lockWallet()
      }
      case "IS_INITIALIZED": {
        return sendToTabAndUi({
          type: "IS_INITIALIZED_RES",
          data: await existsL1(),
        })
      }
      case "GET_WALLETS": {
        return sendToTabAndUi({
          type: "GET_WALLETS_RES",
          data: await getWallets(),
        })
      }
      case "NEW_ACCOUNT": {
        if (!isUnlocked()) {
          throw Error("you need an open session")
        }

        const network = msg.data
        let newAccount
        try {
          newAccount = await createAccount(network)
        } catch (e: any) {
          let error = `${e}`
          if (network.includes("localhost")) {
            if (error.toLowerCase().includes("network error")) {
              error = `${error}\n\nTo deploy an account to localhost, you need to run a local development node. Lookup 'starknet-devnet' and 'nile'.`
            }
            if (error.includes("403")) {
              error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
            }
          }
          return sendToTabAndUi({
            type: "NEW_ACCOUNT_REJ",
            data: { status: "ko", error },
          })
        }

        const { wallet } = newAccount
        selectedWalletStore.setItem("SELECTED_WALLET", wallet)
        transactionTracker.trackTransaction(newAccount.txHash, wallet, {
          title: "Deploy wallet",
        })

        return sendToTabAndUi({
          type: "NEW_ACCOUNT_RES",
          data: { status: "ok", address: wallet.address, ...newAccount },
        })
      }

      case "ADD_SIGN": {
        const { meta } = await actionQueue.push({
          type: "SIGN",
          payload: msg.data,
        })

        return sendToTabAndUi({
          type: "ADD_SIGN_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      case "RECOVER_KEYSTORE": {
        await importKeystore(msg.data)
        return sendToTabAndUi({ type: "RECOVER_KEYSTORE_RES" })
      }
      case "DOWNLOAD_BACKUP_FILE": {
        await downloadBackupFile()
        return sendToTabAndUi({ type: "DOWNLOAD_BACKUP_FILE_RES" })
      }

      case "DELETE_ACCOUNT": {
        try {
          await deleteAccount(msg.data)
          return sendToTabAndUi({ type: "DELETE_ACCOUNT_RES" })
        } catch {
          return sendToTabAndUi({ type: "DELETE_ACCOUNT_REJ" })
        }
      }
    }
  })
})()
