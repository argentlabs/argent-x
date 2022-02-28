import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
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
  removeTab,
  sendMessageToActiveTabs,
  sendMessageToActiveTabsAndUi,
  sendMessageToUi,
} from "./activeTabs"
import { downloadFile } from "./download"
import { getKeyPair } from "./keys/communication"
import { getNonce, increaseStoredNonce, resetStoredNonce } from "./nonce"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "./notification"
import { openUi } from "./openUi"
import { isPreAuthorized, preAuthorize } from "./preAuthorizations"
import { Storage, clearStorage, setToStorage } from "./storage"
import { TransactionTracker, getTransactionStatus } from "./trackTransactions"
import { addToWhitelist, isOnWhitelist, removeFromWhitelist } from "./whitelist"
import { Wallet, WalletStorageProps } from "./wallet"

;(async () => {
  const { privateKey, publicKeyJwk } = await getKeyPair()

  const storage = new Storage<WalletStorageProps>({}, "wallet")
  const wallet = new Wallet(storage, ArgentCompiledContract)
  await wallet.setup()

  const transactionTracker = new TransactionTracker(async (transactions) => {
    if (transactions.length > 0) {
      sendMessageToUi({
        type: "TRANSACTION_UPDATES",
        data: transactions,
      })

      for (const transaction of transactions) {
        const { hash, status, accountAddress, meta } = transaction
        if (
          (status === "ACCEPTED_ON_L2" || status === "REJECTED") &&
          !(await hasShownNotification(hash))
        ) {
          addToAlreadyShown(hash)
          sentTransactionNotification(hash, status, meta)
          if (accountAddress) {
            const data = { hash, status, accountAddress, meta }
            if (status === "ACCEPTED_ON_L2") {
              sendMessageToUi({ type: "TRANSACTION_SUCCESS", data })
            } else if (status === "REJECTED") {
              const { failureReason } = transaction
              sendMessageToUi({
                type: "TRANSACTION_FAILURE",
                data: { ...data, failureReason },
              })
            }
          }
        }
        // on error remove stored (increased) nonce
        if (accountAddress && status === "REJECTED") {
          resetStoredNonce(accountAddress)
        }
      }
    }
  }, 30 * 1000)

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

      case "GET_SELECTED_ACCOUNT": {
        const selectedAccount = await wallet.getSelectedAccount()

        return sendToTabAndUi({
          type: "GET_SELECTED_ACCOUNT_RES",
          data: selectedAccount,
        })
      }

      case "CONNECT_DAPP": {
        const selectedAccount = await wallet.getSelectedAccount()
        const isAuthorized = await isPreAuthorized(msg.data.host)

        addTab(sender.tab?.id)

        if (!isAuthorized) {
          await actionQueue.push({
            type: "CONNECT_DAPP",
            payload: { host: msg.data.host },
          })
        }

        if (isAuthorized && selectedAccount.address) {
          return sendToTabAndUi({
            type: "CONNECT_DAPP_RES",
            data: selectedAccount,
          })
        }

        return openUi()
      }

      case "DISCONNECT": {
        const { host } = msg.data
        const isWhitelisted = await isOnWhitelist(host)

        if (isWhitelisted) {
          removeTab(sender.tab?.id)
          await removeFromWhitelist(host)
        }

        return sendToTabAndUi({ type: "DISCONNECT_RES" })
      }

      case "WALLET_CONNECTED": {
        return selectedWalletStore.setItem("SELECTED_WALLET", msg.data)

      case "CONNECT_ACCOUNT": {
        return await wallet.selectAccount(msg.data.address)
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
            const transaction = action.payload
            if (!wallet.isSessionOpen()) {
              throw Error("you need an open session")
            }
            const selectedAccount = await wallet.getSelectedAccount()
            const signer = await wallet.getSelectedAccountSigner()

            try {
              const nonce = await getNonce(signer)

              const tx = await signer.addTransaction({ ...transaction, nonce })

              increaseStoredNonce(signer.address)
              transactionTracker.trackTransaction(
                tx.transaction_hash,
                selectedAccount,
              )

              return sendToTabAndUi({
                type: "TRANSACTION_SUBMITTED",
                data: {
                  txHash: tx.transaction_hash,
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
            const signer = await wallet.getSelectedAccountSigner()

            const [r, s] = await signer.signMessage(typedData)

            return sendToTabAndUi({
              type: "SIGNATURE_SUCCESS",
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

      case "SIGNATURE_FAILURE":
      case "REJECT_PREAUTHORIZATION":
      case "REJECT_ADD_TOKEN":
      case "TRANSACTION_FAILED": {
        return await actionQueue.remove(msg.data.actionHash)
      }

      case "RESET_ALL": {
        clearStorage()
        return wallet.lock()
      }

      case "PREAUTHORIZE": {
        return actionQueue.push({
          type: "CONNECT_DAPP",
          payload: { host: msg.data },
        })
      }
      case "IS_PREAUTHORIZED": {
        const valid = await isPreAuthorized(msg.data)
        return sendToTabAndUi({ type: "IS_PREAUTHORIZED_RES", data: valid })
      }
      case "RESET_PREAUTHORIZATIONS": {
        setToStorage(`PREAUTHORIZATION:APPROVED`, [])
        setToStorage(`PREAUTHORIZATION:PENDING`, [])
        return
      }
      case "GET_PUBLIC_KEY": {
        return sendToTabAndUi({
          type: "GET_PUBLIC_KEY_RES",
          data: publicKeyJwk,
        })
      }
      case "START_SESSION": {
        const { secure, body } = msg.data
        if (secure !== true) {
          throw Error("session can only be started with encryption")
        }
        const { plaintext } = await compactDecrypt(body, privateKey)
        const sessionPassword = encode.arrayBufferToString(plaintext)
        if (await wallet.startSession(sessionPassword)) {
          sendToTabAndUi({ type: "START_SESSION_RES" })
        }
        return sendToTabAndUi({ type: "START_SESSION_REJ" })
      }
      case "HAS_SESSION": {
        return sendToTabAndUi({
          type: "HAS_SESSION_RES",
          data: wallet.isSessionOpen(),
        })
      }
      case "STOP_SESSION": {
        return wallet.lock()
      }
      case "IS_INITIALIZED": {
        return sendToTabAndUi({
          type: "IS_INITIALIZED_RES",
          data: wallet.isInitialized(),
        })
      }
      case "GET_ACCOUNTS": {
        return sendToTabAndUi({
          type: "GET_ACCOUNTS_RES",
          data: wallet.getAccounts(),
        })
      }
      case "NEW_ACCOUNT": {
        if (!wallet.isSessionOpen()) {
          throw Error("you need an open session")
        }

        const network = msg.data
        try {
          const { account, txHash } = await wallet.addAccount(network)
          transactionTracker.trackTransaction(txHash, account, {
            title: "Deploy wallet",
          })

          return sendToTabAndUi({
            type: "NEW_ACCOUNT_RES",
            data: {
              status: "ok",
              txHash,
              address: account.address,
              account: account,
              accounts: wallet.getAccounts(),
            },
          })
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

      case "RECOVER_BACKUP": {
        await wallet.importBackup(msg.data)
        return sendToTabAndUi({ type: "RECOVER_BACKUP_RES" })
      }
      case "DOWNLOAD_BACKUP_FILE": {
        await downloadFile(wallet.exportBackup())
        return sendToTabAndUi({ type: "DOWNLOAD_BACKUP_FILE_RES" })
      }

      case "DELETE_ACCOUNT": {
        try {
          await wallet.removeAccount(msg.data)
          return sendToTabAndUi({ type: "DELETE_ACCOUNT_RES" })
        } catch {
          return sendToTabAndUi({ type: "DELETE_ACCOUNT_REJ" })
        }
      }
    }
  })
})()
