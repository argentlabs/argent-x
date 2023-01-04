import { getAccounts, removeAccount } from "../shared/account/store"
import { AccountMessage } from "../shared/messages/AccountMessage"
import { deployAccountAction } from "./accountDeploy"
import { upgradeAccount } from "./accountUpgrade"
import { sendMessageToUi } from "./activeTabs"
import { analytics } from "./analytics"
import { HandleMessage, UnhandledMessage } from "./background"
import { encryptForUi } from "./crypto"
import { tryToMintFeeToken } from "./devnet/mintFeeToken"
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
          meta: { title: "Redeploy wallet" },
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
        await wallet.exportPrivateKey(),
        msg.data.encryptedSecret,
        privateKey,
      )

      return sendMessageToUi({
        type: "GET_ENCRYPTED_PRIVATE_KEY_RES",
        data: { encryptedPrivateKey },
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
  }

  throw new UnhandledMessage()
}
