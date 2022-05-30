import { EncryptJWT, compactDecrypt, importJWK } from "jose"
import { encode, number } from "starknet"

import {
  addTab,
  removeTabOfHost,
  sendMessageToHost,
  sendMessageToUi,
} from "./activeTabs"
import { analytics } from "./analytics"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { getNetworkByChainId, hasNetwork } from "./customNetworks"
import { addNetworks, getNetworks, removeNetworks } from "./customNetworks"
import { downloadFile } from "./download"
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
import { clearStorage } from "./storage"
import { addToken, getTokens, hasToken, removeToken } from "./tokens"
import { trackTransations } from "./transactions/notifications"
import { getTransactionsStore } from "./transactions/store"
import { nameTransaction } from "./transactions/transactionNames"
import { getTransactionsTracker } from "./transactions/transactions"

export const handleMiscMessage: HandleMessage = async ({
  msg,
  sender,
  background,
  keyPair: { publicKeyJwk, privateKey },
  sendToTabAndUi,
}) => {
  const { wallet, transactionTracker, actionQueue } = background

  switch (msg.type) {
    case "OPEN_UI": {
      return openUi()
    }

    case "GET_ACTIONS": {
      const actions = await actionQueue.getAll()
      return sendToTabAndUi({
        type: "GET_ACTIONS_RES",
        data: actions,
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

            const { maxFee } = action.override || {}
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
        background.transactionTracker = await getTransactionsTracker(
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

    case "DELETE_ACCOUNT": {
      try {
        await wallet.removeAccount(msg.data)
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_RES" })
      } catch {
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_REJ" })
      }
    }
  }

  throw new UnhandledMessage()
}
