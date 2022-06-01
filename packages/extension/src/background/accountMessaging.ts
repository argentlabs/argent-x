import { number, stark } from "starknet"

import { AccountMessage } from "../shared/messages/AccountMessage"
import { sendMessageToUi } from "./activeTabs"
import { HandleMessage, UnhandledMessage } from "./background"
import { encrypt } from "./crypto"
import { getNetwork } from "./customNetworks"
import { getImplementationUpgradePath } from "./upgrade"

export const handleAccountMessage: HandleMessage<AccountMessage> = async ({
  msg,
  background: { wallet, transactionTracker },
  messagingKeys: { privateKey },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_ACCOUNTS": {
      return sendToTabAndUi({
        type: "GET_ACCOUNTS_RES",
        data: await wallet.getAccounts(),
      })
    }

    case "CONNECT_ACCOUNT": {
      return await wallet.selectAccount(msg.data.address)
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

    case "GET_SELECTED_ACCOUNT": {
      const selectedAccount = await wallet.getSelectedAccount()
      return sendToTabAndUi({
        type: "GET_SELECTED_ACCOUNT_RES",
        data: selectedAccount,
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

      const updateAccount = getImplementationUpgradePath(currentImplementation)

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

    case "DELETE_ACCOUNT": {
      try {
        await wallet.removeAccount(msg.data)
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_RES" })
      } catch {
        return sendToTabAndUi({ type: "DELETE_ACCOUNT_REJ" })
      }
    }

    case "EXPORT_PRIVATE_KEY": {
      const privateKey = await wallet.exportPrivateKey()

      return sendToTabAndUi({
        type: "EXPORT_PRIVATE_KEY_RES",
        data: { privateKey },
      })
    }

    case "GET_ENCRYPTED_SEED_PHRASE": {
      if (!wallet.isSessionOpen()) {
        throw Error("you need an open session")
      }

      const encryptedSeedPhrase = await encrypt(
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
