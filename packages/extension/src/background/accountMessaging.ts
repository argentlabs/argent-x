import { AccountMessage } from "../shared/messages/AccountMessage"
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
        data: await wallet.getAccounts(msg.data?.showHidden),
      })
    }

    case "CONNECT_ACCOUNT": {
      await wallet.selectAccount(msg.data)
      return sendToTabAndUi({
        type: "CONNECT_ACCOUNT_RES",
        data: msg.data,
      })
    }

    case "NEW_ACCOUNT": {
      if (!wallet.isSessionOpen()) {
        throw Error("you need an open session")
      }

      const network = msg.data
      try {
        const { account, txHash } = await wallet.addAccount(network)
        addTransaction({
          hash: txHash,
          account,
          meta: { title: "Deploy wallet" },
        })

        return sendToTabAndUi({
          type: "NEW_ACCOUNT_RES",
          data: {
            txHash,
            address: account.address,
            account: account,
            accounts: await wallet.getAccounts(),
          },
        })
      } catch (exception: unknown) {
        let error = `${exception}`
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
          data: { error },
        })
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
          account: msg.data,
          wallet,
          actionQueue,
        })
        return sendToTabAndUi({ type: "UPGRADE_ACCOUNT_RES" })
      } catch {
        return sendToTabAndUi({ type: "UPGRADE_ACCOUNT_REJ" })
      }
    }

    case "DELETE_ACCOUNT": {
      try {
        await wallet.removeAccount(msg.data)
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_RES" })
      } catch {
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_REJ" })
      }
    }

    case "HIDE_ACCOUNT": {
      try {
        await wallet.hideAccount(msg.data)
        return sendToTabAndUi({
          type: "HIDE_ACCOUNT_RES",
        })
      } catch {
        return sendToTabAndUi({ type: "HIDE_ACCOUNT_REJ" })
      }
    }

    case "GET_ENCRYPTED_PRIVATE_KEY": {
      if (!wallet.isSessionOpen()) {
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
      if (!wallet.isSessionOpen()) {
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
  }

  throw new UnhandledMessage()
}
