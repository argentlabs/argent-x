import { getAccounts, removeAccount } from "../shared/account/store"
import { AccountMessage } from "../shared/messages/AccountMessage"
import { deployAccountAction } from "./accountDeploy"
import { upgradeAccount } from "./accountUpgrade"
import { sendMessageToUi } from "./activeTabs"
import { HandleMessage, UnhandledMessage } from "./background"
import { encryptForUi } from "./crypto"
import { addTransaction } from "./transactions/store"

export const handleAccountMessage: HandleMessage<AccountMessage> = async ({
  msg,
  background: { wallet, actionQueue },
  messagingKeys: { privateKey },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_ACCOUNTS": {
      return sendToTabAndUi({
        type: "GET_ACCOUNTS_RES",
        data: await getAccounts(msg.data?.showHidden ? () => true : undefined),
      })
    }

    case "CONNECT_ACCOUNT": {
      // Select an Account of BaseWalletAccount type
      await wallet.selectAccount(msg.data)

      // Return of Account of WalletAccount type
      const walletAccount = await wallet.getSelectedAccount()

      if (!walletAccount) {
        throw new Error(
          `Could not select account in wallet with address ${msg.data.address} and networkId ${msg.data.networkId}`,
        )
      }

      return sendToTabAndUi({
        type: "CONNECT_ACCOUNT_RES",
        data: walletAccount,
      })
    }

    case "NEW_ACCOUNT": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const network = msg.data
      try {
        const account = await wallet.newAccount(network)

        const accounts = await getAccounts()

        return sendToTabAndUi({
          type: "NEW_ACCOUNT_RES",
          data: {
            account,
            accounts,
          },
        })
      } catch (exception: unknown) {
        const error = `${exception}`

        return sendToTabAndUi({
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
        return sendToTabAndUi({ type: "DEPLOY_ACCOUNT_RES" })
      } catch {
        return sendToTabAndUi({ type: "DEPLOY_ACCOUNT_REJ" })
      }
    }

    case "GET_SELECTED_ACCOUNT": {
      const selectedAccount = await wallet.getSelectedAccount()
      return sendToTabAndUi({
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
        return sendToTabAndUi({ type: "UPGRADE_ACCOUNT_RES" })
      } catch {
        return sendToTabAndUi({ type: "UPGRADE_ACCOUNT_REJ" })
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
        return sendToTabAndUi({
          type: "REDEPLOY_ACCOUNT_RES",
          data: {
            txHash,
            address: account.address,
          },
        })
      } catch {
        return sendToTabAndUi({ type: "REDEPLOY_ACCOUNT_REJ" })
      }
    }

    case "DELETE_ACCOUNT": {
      try {
        await removeAccount(msg.data)
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_RES" })
      } catch {
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_REJ" })
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

      return sendToTabAndUi({
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
