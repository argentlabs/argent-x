import { constants, number } from "starknet"

import { getAccounts, removeAccount } from "../shared/account/store"
import { tryToMintFeeToken } from "../shared/devnet/mintFeeToken"
import { AccountMessage } from "../shared/messages/AccountMessage"
import { isEqualAddress } from "../ui/services/addresses"
import { deployAccountAction } from "./accountDeploy"
import { upgradeAccount } from "./accountUpgrade"
import { sendMessageToUi } from "./activeTabs"
import { analytics } from "./analytics"
import { HandleMessage, UnhandledMessage } from "./background"
import { encryptForUi } from "./crypto"
import { addTransaction } from "./transactions/store"

export const handleAccountMessage: HandleMessage<AccountMessage> = async ({
  msg,
  background: { wallet, actionQueue },
  messagingKeys: { privateKey },
  respond,
}) => {
  switch (msg.type) {
    case "GET_ACCOUNTS": {
      return sendMessageToUi({
        type: "GET_ACCOUNTS_RES",
        data: await getAccounts(msg.data?.showHidden ? () => true : undefined),
      })
    }

    case "CONNECT_ACCOUNT": {
      // Select an Account of BaseWalletAccount type
      const selectedAccount = await wallet.getSelectedAccount()

      return respond({
        type: "CONNECT_ACCOUNT_RES",
        data: selectedAccount,
      })
    }

    case "NEW_ACCOUNT": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const network = msg.data
      try {
        const account = await wallet.newAccount(network)

        tryToMintFeeToken(account)

        analytics.track("createAccount", {
          status: "success",
          networkId: network,
        })

        const accounts = await getAccounts()

        return sendMessageToUi({
          type: "NEW_ACCOUNT_RES",
          data: {
            account,
            accounts,
          },
        })
      } catch (exception) {
        const error = `${exception}`

        analytics.track("createAccount", {
          status: "failure",
          networkId: network,
          errorMessage: error,
        })

        return sendMessageToUi({
          type: "NEW_ACCOUNT_REJ",
          data: { error },
        })
      }
    }

    case "DEPLOY_ACCOUNT": {
      try {
        await deployAccountAction({
          account: msg.data,
          actionQueue,
        })

        return sendMessageToUi({ type: "DEPLOY_ACCOUNT_RES" })
      } catch (e) {
        return sendMessageToUi({ type: "DEPLOY_ACCOUNT_REJ" })
      }
    }

    case "GET_SELECTED_ACCOUNT": {
      const selectedAccount = await wallet.getSelectedAccount()
      return sendMessageToUi({
        type: "GET_SELECTED_ACCOUNT_RES",
        data: selectedAccount,
      })
    }

    case "UPGRADE_ACCOUNT": {
      try {
        await upgradeAccount({
          account: msg.data.wallet,
          wallet,
          actionQueue,
          targetImplementationType: msg.data.targetImplementationType,
        })
        return sendMessageToUi({ type: "UPGRADE_ACCOUNT_RES" })
      } catch {
        return sendMessageToUi({ type: "UPGRADE_ACCOUNT_REJ" })
      }
    }

    case "REDEPLOY_ACCOUNT": {
      try {
        const account = msg.data
        const fullAccount = await wallet.getAccount(account)
        const { txHash } = await wallet.redeployAccount(fullAccount)
        addTransaction({
          hash: txHash,
          account: fullAccount,
          meta: { title: "Redeploy wallet", type: "DEPLOY_ACCOUNT" },
        })
        return sendMessageToUi({
          type: "REDEPLOY_ACCOUNT_RES",
          data: {
            txHash,
            address: account.address,
          },
        })
      } catch {
        return sendMessageToUi({ type: "REDEPLOY_ACCOUNT_REJ" })
      }
    }

    case "DELETE_ACCOUNT": {
      try {
        await removeAccount(msg.data)
        return sendMessageToUi({ type: "DELETE_ACCOUNT_RES" })
      } catch {
        return sendMessageToUi({ type: "DELETE_ACCOUNT_REJ" })
      }
    }

    case "GET_ENCRYPTED_PRIVATE_KEY": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const encryptedPrivateKey = await encryptForUi(
        await wallet.exportPrivateKey(msg.data.account),
        msg.data.encryptedSecret,
        privateKey,
      )

      return sendMessageToUi({
        type: "GET_ENCRYPTED_PRIVATE_KEY_RES",
        data: { encryptedPrivateKey },
      })
    }

    case "GET_PUBLIC_KEY": {
      const publicKey = await wallet.getPublicKey(msg.data)

      return sendMessageToUi({
        type: "GET_PUBLIC_KEY_RES",
        data: { publicKey },
      })
    }

    case "GET_ENCRYPTED_SEED_PHRASE": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const encryptedSeedPhrase = await encryptForUi(
        await wallet.getSeedPhrase(),
        msg.data.encryptedSecret,
        privateKey,
      )

      return sendMessageToUi({
        type: "GET_ENCRYPTED_SEED_PHRASE_RES",
        data: { encryptedSeedPhrase },
      })
    }

    case "DEPLOY_ACCOUNT_ACTION_FAILED": {
      return await actionQueue.remove(msg.data.actionHash)
    }

    case "ACCOUNT_CHANGE_GUARDIAN": {
      try {
        const { account, guardian } = msg.data
        await actionQueue.push({
          type: "TRANSACTION",
          payload: {
            transactions: {
              contractAddress: account.address,
              entrypoint: "changeGuardian",
              calldata: [
                number.hexToDecimalString(
                  guardian || constants.ZERO.toString(),
                ),
              ],
            },
            meta: {
              isChangeGuardian: true,
              title: "Change account guardian",
              type: "INVOKE_FUNCTION",
            },
          },
        })
        return sendMessageToUi({
          type: "ACCOUNT_CHANGE_GUARDIAN_RES",
        })
      } catch (error) {
        return sendMessageToUi({
          type: "ACCOUNT_CHANGE_GUARDIAN_REJ",
          data: `${error}`,
        })
      }
    }

    case "ACCOUNT_CANCEL_ESCAPE": {
      try {
        const { account } = msg.data
        await actionQueue.push({
          type: "TRANSACTION",
          payload: {
            transactions: {
              contractAddress: account.address,
              entrypoint: "cancelEscape",
              calldata: [],
            },
            meta: {
              isCancelEscape: true,
              title: "Cancel escape",
              type: "INVOKE_FUNCTION",
            },
          },
        })
        return sendMessageToUi({
          type: "ACCOUNT_CANCEL_ESCAPE_RES",
        })
      } catch (error) {
        return sendMessageToUi({
          type: "ACCOUNT_CANCEL_ESCAPE_REJ",
          data: `${error}`,
        })
      }
    }

    case "ACCOUNT_TRIGGER_ESCAPE_GUARDIAN": {
      try {
        const { account } = msg.data
        await actionQueue.push({
          type: "TRANSACTION",
          payload: {
            transactions: {
              contractAddress: account.address,
              entrypoint: "triggerEscapeGuardian",
              calldata: [],
            },
            meta: {
              isCancelEscape: true,
              title: "Trigger escape guardian",
              type: "INVOKE_FUNCTION",
            },
          },
        })
        return sendMessageToUi({
          type: "ACCOUNT_TRIGGER_ESCAPE_GUARDIAN_RES",
        })
      } catch (error) {
        return sendMessageToUi({
          type: "ACCOUNT_TRIGGER_ESCAPE_GUARDIAN_REJ",
          data: `${error}`,
        })
      }
    }

    case "ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN": {
      try {
        const { account } = msg.data
        /**
         * This is a two-stage process
         *
         * 1. call escapeGuardian with current signer key as new guardian key
         * 2. changeGuardian to ZERO, signed twice by same signer key (like 2/2 multisig with same key)
         */

        const selectedAccount = await wallet.getAccount(account)
        if (!selectedAccount) {
          throw Error("no account selected")
        }

        const publicKey = await wallet.getPublicKey(account)

        if (
          selectedAccount.guardian &&
          isEqualAddress(selectedAccount.guardian, publicKey)
        ) {
          /**
           * Account already used `escapeGuardian` to change guardian to this account publicKey
           * Call `changeGuardian` to ZERO
           */

          await actionQueue.push({
            type: "TRANSACTION",
            payload: {
              transactions: {
                contractAddress: account.address,
                entrypoint: "changeGuardian",
                calldata: [
                  number.hexToDecimalString(constants.ZERO.toString()),
                ],
              },
              meta: {
                isChangeGuardian: true,
                title: "Change account guardian",
                type: "INVOKE_FUNCTION",
              },
            },
          })
        } else {
          /**
           * Call `escapeGuardian` to change guardian to this account publicKey
           */
          await actionQueue.push({
            type: "TRANSACTION",
            payload: {
              transactions: {
                contractAddress: account.address,
                entrypoint: "escapeGuardian",
                calldata: [number.hexToDecimalString(publicKey)],
              },
              meta: {
                isChangeGuardian: true,
                title: "Escape account guardian",
                type: "INVOKE_FUNCTION",
              },
            },
          })
        }

        return sendMessageToUi({
          type: "ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN_RES",
        })
      } catch (error) {
        return sendMessageToUi({
          type: "ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN_REJ",
          data: `${error}`,
        })
      }
    }
  }

  throw new UnhandledMessage()
}
