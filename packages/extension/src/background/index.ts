import { EncryptJWT, compactDecrypt, importJWK } from "jose"
import { encode, number, stark } from "starknet"

import { ActionItem } from "../shared/actionQueue"
import { messageStream } from "../shared/messages"
import { MessageType } from "../shared/MessageType"
import { loadContracts } from "./accounts"
import { getQueue } from "./actionQueue"
import {
  addTab,
  hasTab,
  removeTabOfHost,
  sendMessageToActiveTabs,
  sendMessageToActiveTabsAndUi,
  sendMessageToHost,
  sendMessageToUi,
} from "./activeTabs"
import { analytics } from "./analytics"
import {
  getNetworkByChainId,
  getNetwork as getNetworkImplementation,
  hasNetwork,
} from "./customNetworks"
import {
  addNetworks,
  getNetwork,
  getNetworks,
  removeNetworks,
} from "./customNetworks"
import { downloadFile } from "./download"
import { getKeyPair } from "./keys/communication"
import { exportLegacyBackup, hasLegacy } from "./legacy"
import { getNetworkStatuses } from "./networkStatus"
import { getNonce, increaseStoredNonce } from "./nonce"
import { openUi } from "./openUi"
import {
  isPreAuthorized,
  preAuthorize,
  removePreAuthorization,
  resetPreAuthorizations,
} from "./preAuthorizations"
import { Storage, clearStorage } from "./storage"
import { addToken, getTokens, hasToken, removeToken } from "./tokens"
import { trackTransations } from "./transactions/notifications"
import { getTransactionsStore } from "./transactions/store"
import { nameTransaction } from "./transactions/transactionNames"
import { getTransactionsTracker } from "./transactions/transactions"
import { getImplementationUpgradePath } from "./upgrade"
import { Wallet, WalletStorageProps } from "./wallet"

;(async () => {
  const { privateKey, publicKeyJwk } = await getKeyPair()

  const storage = new Storage<WalletStorageProps>({}, "wallet")
  const onAutoLock = () =>
    sendMessageToActiveTabsAndUi({ type: "DISCONNECT_ACCOUNT" })
  const wallet = new Wallet(
    storage,
    ...(await loadContracts()),
    getNetworkImplementation,
    onAutoLock,
  )
  await wallet.setup()

  // may get reassigned when a recovery happens
  let transactionTracker = await getTransactionsTracker(
    await wallet.getAccounts(),
    getTransactionsStore,
    trackTransations,
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
        const transactions = await transactionTracker.getAll()

        return sendToTabAndUi({
          type: "GET_TRANSACTIONS_RES",
          data: transactions,
        })
      }

      case "GET_TRANSACTION": {
        const tracked = await transactionTracker.get(msg.data.hash)
        if (tracked) {
          return sendToTabAndUi({
            type: "GET_TRANSACTION_RES",
            data: tracked,
          })
        }

        return sendToTabAndUi({
          type: "GET_TRANSACTION_REJ",
        })
      }

      case "EXECUTE_TRANSACTION": {
        const { meta } = await actionQueue.push({
          type: "TRANSACTION",
          payload: msg.data,
        })
        return sendToTabAndUi({
          type: "EXECUTE_TRANSACTION_RES",
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

        if (sender.tab?.id) {
          addTab({
            id: sender.tab?.id,
            host: msg.data.host,
          })
        }

        if (!isAuthorized) {
          await actionQueue.push({
            type: "CONNECT_DAPP",
            payload: { host: msg.data.host },
          })
        }

        if (isAuthorized && selectedAccount?.address) {
          return sendToTabAndUi({
            type: "CONNECT_DAPP_RES",
            data: selectedAccount,
          })
        }

        return openUi()
      }

      case "CONNECT_ACCOUNT": {
        return await wallet.selectAccount(msg.data.address)
      }

      case "GET_CUSTOM_NETWORKS": {
        const networks = await getNetworks()
        return sendToTabAndUi({
          type: "GET_CUSTOM_NETWORKS_RES",
          data: networks,
        })
      }
      case "ADD_CUSTOM_NETWORKS": {
        const networks = msg.data
        const newNetworks = await addNetworks(networks)
        await Promise.all(
          newNetworks.map(
            (network) => wallet.discoverAccountsForNetwork(network.id, 2), // just close gaps up to 1 blank space, as these networks are new and should be linked lists
          ),
        )
        return sendToTabAndUi({
          type: "ADD_CUSTOM_NETWORKS_RES",
          data: newNetworks,
        })
      }
      case "REMOVE_CUSTOM_NETWORKS": {
        const networks = msg.data
        return sendToTabAndUi({
          type: "REMOVE_CUSTOM_NETWORKS_RES",
          data: await removeNetworks(networks),
        })
      }
      case "GET_NETWORK_STATUSES": {
        const networks = msg.data?.length ? msg.data : await getNetworks()
        const statuses = await getNetworkStatuses(networks)
        return sendToTabAndUi({
          type: "GET_NETWORK_STATUSES_RES",
          data: statuses,
        })
      }

      case "ESTIMATE_TRANSACTION_FEE": {
        const selectedAccount = await wallet.getSelectedAccount()
        const starknetAccount = await wallet.getSelectedStarknetAccount()
        if (!selectedAccount) {
          throw Error("no accounts")
        }
        try {
          const { amount, unit, suggestedMaxFee } =
            await starknetAccount.estimateFee(msg.data)

          return sendToTabAndUi({
            type: "ESTIMATE_TRANSACTION_FEE_RES",
            data: {
              amount: number.toHex(amount),
              unit,
              suggestedMaxFee: number.toHex(suggestedMaxFee),
            },
          })
        } catch {
          return sendToTabAndUi({
            type: "ESTIMATE_TRANSACTION_FEE_REJ",
          })
        }
      }

      case "UPDATE_TRANSACTION_FEE": {
        const { actionHash } = msg.data
        await actionQueue.override(actionHash, {
          maxFee: msg.data.maxFee,
        })

        return sendToTabAndUi({
          type: "UPDATE_TRANSACTION_FEE_RES",
          data: {
            actionHash,
          },
        })
      }

      case "UPGRADE_ACCOUNT": {
        const { walletAddress } = msg.data
        const starknetAccount = await wallet.getStarknetAccountByAddress(
          walletAddress,
        )

        const account = await wallet.getAccountByAddress(walletAddress)
        const { accountImplementation: newImplementation } = await getNetwork(
          account.network.id,
        )

        const { result } = await starknetAccount.callContract({
          contractAddress: account.address,
          entrypoint: "get_implementation",
        })
        const currentImplementation = stark.makeAddress(number.toHex(result[0]))

        const updateAccount = getImplementationUpgradePath(
          currentImplementation,
        )

        const updateTransaction = await updateAccount(
          newImplementation,
          account.address,
          starknetAccount, // Account extends Provider
          wallet.getKeyPairByDerivationPath(account.signer.derivationPath), // signer is a private property of the account, this will be public in the future
        )

        return transactionTracker.add({
          hash: updateTransaction.transaction_hash,
          account,
          meta: { title: "Upgrading account" },
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
              const nonceWasProvidedByUI =
                transactionsDetail?.nonce !== undefined // nonce can be a number of 0 therefore we need to check for undefined
              const nonce = nonceWasProvidedByUI
                ? number.toHex(number.toBN(transactionsDetail?.nonce || 0))
                : await getNonce(starknetAccount)

              const { maxFee } = action.override || {}
              const maxFeeOverrideExists =
                maxFee !== undefined && maxFee !== null

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

      case "SIGNATURE_FAILURE":
      case "REJECT_PREAUTHORIZATION":
      case "REJECT_REQUEST_TOKEN":
      case "REJECT_REQUEST_ADD_CUSTOM_NETWORK":
      case "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK":
      case "TRANSACTION_FAILED": {
        return await actionQueue.remove(msg.data.actionHash)
      }

      case "REQUEST_ADD_CUSTOM_NETWORK": {
        const exists = await hasNetwork(msg.data.chainId)

        if (exists) {
          return sendToTabAndUi({
            type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
            data: {},
          })
        }

        const { meta } = await actionQueue.push({
          type: "REQUEST_ADD_CUSTOM_NETWORK",
          payload: msg.data,
        })

        return sendToTabAndUi({
          type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      case "REQUEST_SWITCH_CUSTOM_NETWORK": {
        const network = await getNetworkByChainId(msg.data.chainId)

        if (!network) {
          return sendToTabAndUi({
            type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
            data: {},
          })
        }

        const { meta } = await actionQueue.push({
          type: "REQUEST_SWITCH_CUSTOM_NETWORK",
          payload: network,
        })

        return sendToTabAndUi({
          type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      case "REQUEST_TOKEN": {
        const exists = await hasToken(msg.data.address)
        if (exists) {
          return sendToTabAndUi({ type: "REQUEST_TOKEN_RES", data: {} })
        }
        const { meta } = await actionQueue.push({
          type: "REQUEST_TOKEN",
          payload: msg.data,
        })
        return sendToTabAndUi({
          type: "REQUEST_TOKEN_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      case "GET_TOKENS": {
        const tokens = await getTokens()
        return sendToTabAndUi({
          type: "GET_TOKENS_RES",
          data: tokens,
        })
      }

      case "REMOVE_TOKEN": {
        const address = msg.data
        const { success, tokens } = await removeToken(address)
        if (success) {
          return sendToTabAndUi({
            type: "UPDATE_TOKENS",
            data: tokens,
          })
        }
        return sendToTabAndUi({
          type: "REMOVE_TOKEN_RES",
          data: success,
        })
      }

      case "ADD_TOKEN": {
        const token = msg.data
        try {
          const { success, tokens } = await addToken(token)
          if (success) {
            return sendToTabAndUi({
              type: "UPDATE_TOKENS",
              data: tokens,
            })
          }
          return sendToTabAndUi({
            type: "ADD_TOKEN_RES",
            data: success,
          })
        } catch {
          return sendToTabAndUi({
            type: "ADD_TOKEN_REJ",
          })
        }
      }

      case "RESET_ALL": {
        clearStorage()
        wallet.reset()
        return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
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

      case "REMOVE_PREAUTHORIZATION": {
        const host = msg.data
        await removePreAuthorization(host)
        await sendToTabAndUi({ type: "REMOVE_PREAUTHORIZATION_RES" })
        await sendMessageToHost(
          {
            type: "DISCONNECT_ACCOUNT",
          },
          host,
        )
        removeTabOfHost(host)
        break
      }
      case "RESET_PREAUTHORIZATIONS": {
        await resetPreAuthorizations()
        return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
      }
      case "GET_PUBLIC_KEY": {
        return sendMessageToUi({
          type: "GET_PUBLIC_KEY_RES",
          data: publicKeyJwk,
        })
      }
      case "GET_ENCRYPTED_SEED_PHRASE": {
        if (!wallet.isSessionOpen()) {
          throw Error("you need an open session")
        }
        const { encryptedSecret } = msg.data
        const { plaintext } = await compactDecrypt(encryptedSecret, privateKey)

        const symmetricSecret = await importJWK(
          JSON.parse(encode.arrayBufferToString(plaintext)),
        )
        const seedPhrase = await wallet.getSeedPhrase()
        const encryptedSeedPhrase = await new EncryptJWT({
          seedPhrase,
        })
          .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
          .encrypt(symmetricSecret)

        return sendMessageToUi({
          type: "GET_ENCRYPTED_SEED_PHRASE_RES",
          data: { encryptedSeedPhrase },
        })
      }
      case "RECOVER_SEEDPHRASE": {
        try {
          const { secure, body } = msg.data
          if (secure !== true) {
            throw Error("session can only be started with encryption")
          }
          const { plaintext } = await compactDecrypt(body, privateKey)
          const {
            seedPhrase,
            newPassword,
          }: {
            seedPhrase: string
            newPassword: string
          } = JSON.parse(encode.arrayBufferToString(plaintext))

          await wallet.restoreSeedPhrase(seedPhrase, newPassword)
          transactionTracker = await getTransactionsTracker(
            await wallet.getAccounts(),
            getTransactionsStore,
            trackTransations,
          )

          return sendToTabAndUi({ type: "RECOVER_SEEDPHRASE_RES" })
        } catch {
          return sendToTabAndUi({ type: "RECOVER_SEEDPHRASE_REJ" })
        }
      }
      case "START_SESSION": {
        const { secure, body } = msg.data
        if (secure !== true) {
          throw Error("session can only be started with encryption")
        }
        const { plaintext } = await compactDecrypt(body, privateKey)
        const sessionPassword = encode.arrayBufferToString(plaintext)
        const result = await wallet.startSession(sessionPassword, (percent) => {
          sendToTabAndUi({ type: "LOADING_PROGRESS", data: percent })
        })
        if (result) {
          const selectedAccount = await wallet.getSelectedAccount()
          return sendToTabAndUi({
            type: "START_SESSION_RES",
            data: selectedAccount,
          })
        }
        return sendToTabAndUi({ type: "START_SESSION_REJ" })
      }
      case "CHECK_PASSWORD": {
        const { body } = msg.data
        const { plaintext } = await compactDecrypt(body, privateKey)
        const password = encode.arrayBufferToString(plaintext)
        if (wallet.checkPassword(password)) {
          return sendToTabAndUi({ type: "CHECK_PASSWORD_RES" })
        }
        return sendToTabAndUi({ type: "CHECK_PASSWORD_REJ" })
      }
      case "HAS_SESSION": {
        return sendToTabAndUi({
          type: "HAS_SESSION_RES",
          data: wallet.isSessionOpen(),
        })
      }
      case "STOP_SESSION": {
        wallet.lock()
        return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
      }
      case "IS_INITIALIZED": {
        const initialized = wallet.isInitialized()
        const legacy = initialized ? false : await hasLegacy()
        return sendToTabAndUi({
          type: "IS_INITIALIZED_RES",
          data: { initialized, hasLegacy: legacy },
        })
      }
      case "GET_ACCOUNTS": {
        return sendToTabAndUi({
          type: "GET_ACCOUNTS_RES",
          data: await wallet.getAccounts(),
        })
      }
      case "NEW_ACCOUNT": {
        if (!wallet.isSessionOpen()) {
          throw Error("you need an open session")
        }

        const network = msg.data
        try {
          const { account, txHash } = await wallet.addAccount(network)
          transactionTracker.addAccount(account, {
            hash: txHash,
            account,
            meta: { title: "Deploy wallet" },
          })

          return sendToTabAndUi({
            type: "NEW_ACCOUNT_RES",
            data: {
              status: "ok",
              txHash,
              address: account.address,
              account: account,
              accounts: await wallet.getAccounts(),
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
        try {
          await wallet.importBackup(msg.data)
          return sendToTabAndUi({ type: "RECOVER_BACKUP_RES" })
        } catch (error) {
          return sendToTabAndUi({
            type: "RECOVER_BACKUP_REJ",
            data: `${error}`,
          })
        }
      }
      case "DOWNLOAD_BACKUP_FILE": {
        await downloadFile(wallet.exportBackup())
        return sendToTabAndUi({ type: "DOWNLOAD_BACKUP_FILE_RES" })
      }

      case "DOWNLOAD_LEGACY_BACKUP_FILE": {
        await downloadFile(await exportLegacyBackup())
        return sendToTabAndUi({ type: "DOWNLOAD_LEGACY_BACKUP_FILE_RES" })
      }

      case "EXPORT_PRIVATE_KEY": {
        const privateKey = await wallet.exportPrivateKey()

        return sendToTabAndUi({
          type: "EXPORT_PRIVATE_KEY_RES",
          data: { privateKey },
        })
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
