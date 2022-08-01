import { sendMessage, waitForMessage } from "../../shared/messages"
import { BaseWalletAccount, WalletAccount } from "../../shared/wallet.model"
import { Account } from "../features/accounts/Account"
import { decryptFromBackground, generateEncryptedSecret } from "./crypto"

export const createNewAccount = async (networkId: string) => {
  sendMessage({ type: "NEW_ACCOUNT", data: networkId })
  return await Promise.race([
    waitForMessage("NEW_ACCOUNT_RES"),
    waitForMessage("NEW_ACCOUNT_REJ"),
  ])
}

export const getLastSelectedAccount = async () => {
  sendMessage({ type: "GET_SELECTED_ACCOUNT" })
  return waitForMessage("GET_SELECTED_ACCOUNT_RES")
}

export const getAccounts = async (showHidden = false) => {
  sendMessage({ type: "GET_ACCOUNTS", data: { showHidden } })
  return waitForMessage("GET_ACCOUNTS_RES")
}

export const accountsOnNetwork = (
  accounts: WalletAccount[],
  networkId: string,
) => accounts.filter((account) => account.networkId === networkId)

export const connectAccount = ({
  address,
  network,
  networkId,
  signer,
}: Account) => {
  sendMessage({
    type: "CONNECT_ACCOUNT",
    data: { address, network, networkId, signer },
  })
}

export const deleteAccount = async (address: string, networkId: string) => {
  sendMessage({
    type: "DELETE_ACCOUNT",
    data: { address, networkId },
  })

  try {
    await Promise.race([
      waitForMessage("DELETE_ACCOUNT_RES"),
      waitForMessage("DELETE_ACCOUNT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not delete account")
  }
}

export const hideAccount = async (address: string, networkId: string) => {
  sendMessage({
    type: "HIDE_ACCOUNT",
    data: { address, networkId },
  })

  await Promise.race([
    waitForMessage("HIDE_ACCOUNT_RES"),
    waitForMessage("HIDE_ACCOUNT_REJ").then(() => {
      throw new Error("Rejected")
    }),
  ])
}

export const unhideAccount = async (address: string, networkId: string) => {
  sendMessage({
    type: "UNHIDE_ACCOUNT",
    data: { address, networkId },
  })

  await Promise.race([
    waitForMessage("UNHIDE_ACCOUNT_RES"),
    waitForMessage("UNHIDE_ACCOUNT_REJ").then(() => {
      throw new Error("Rejected")
    }),
  ])
}

export const upgradeAccount = async (data: BaseWalletAccount) => {
  sendMessage({ type: "UPGRADE_ACCOUNT", data })
  try {
    await Promise.race([
      waitForMessage("UPGRADE_ACCOUNT_RES"),
      waitForMessage("UPGRADE_ACCOUNT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not upgrade account")
  }
}

export const redeployAccount = async (data: BaseWalletAccount) => {
  sendMessage({ type: "REDEPLOY_ACCOUNT", data })
  try {
    return await Promise.race([
      waitForMessage(
        "REDEPLOY_ACCOUNT_RES",
        (message) => message.data.address === data.address,
      ),
      waitForMessage("REDEPLOY_ACCOUNT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not redeploy account")
  }
}

export const getPrivateKey = async () => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "GET_ENCRYPTED_PRIVATE_KEY",
    data: { encryptedSecret },
  })

  const { encryptedPrivateKey } = await waitForMessage(
    "GET_ENCRYPTED_PRIVATE_KEY_RES",
  )

  return await decryptFromBackground(encryptedPrivateKey, secret)
}

export const getSeedPhrase = async (): Promise<string> => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "GET_ENCRYPTED_SEED_PHRASE",
    data: { encryptedSecret },
  })

  const { encryptedSeedPhrase } = await waitForMessage(
    "GET_ENCRYPTED_SEED_PHRASE_RES",
  )

  return await decryptFromBackground(encryptedSeedPhrase, secret)
}
