import { sendMessage, waitForMessage } from "../../shared/messages"
import {
  ArgentAccountType,
  BaseWalletAccount,
  WalletAccount,
} from "../../shared/wallet.model"
import { walletStore } from "../../shared/wallet/walletStore"
import { Account } from "../features/accounts/Account"
import { decryptFromBackground, generateEncryptedSecret } from "./crypto"

export const createNewAccount = async (networkId: string) => {
  sendMessage({ type: "NEW_ACCOUNT", data: networkId })
  try {
    return await Promise.race([
      waitForMessage("NEW_ACCOUNT_RES"),
      waitForMessage("NEW_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could add new account")
  }
}

export const deployNewAccount = async (account: BaseWalletAccount) => {
  sendMessage({ type: "DEPLOY_ACCOUNT", data: account })
  try {
    await Promise.race([
      waitForMessage("DEPLOY_ACCOUNT_RES"),
      waitForMessage("DEPLOY_ACCOUNT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not deploy account")
  }
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

function isNotBaseWalletAccount(
  account?: BaseWalletAccount,
): account is Account {
  return Boolean(account && "toBaseWalletAccount" in account)
}

export const selectAccount = async (
  account?: BaseWalletAccount,
): Promise<void> => {
  /** coerce to sparse BaseWalletAccount to prevent DataCloneError from full Account class instance on FireFox */
  if (isNotBaseWalletAccount(account)) {
    account = account.toBaseWalletAccount()
  }
  await walletStore.set("selected", account ?? null)

  return connectAccount(account)
}

export const connectAccount = (account?: BaseWalletAccount) => {
  sendMessage({
    type: "CONNECT_ACCOUNT",
    data: account,
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

export const upgradeAccount = async (
  wallet: BaseWalletAccount,
  targetImplementationType?: ArgentAccountType,
) => {
  sendMessage({
    type: "UPGRADE_ACCOUNT",
    data: { wallet, targetImplementationType },
  })
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

export const getPrivateKey = async (account: BaseWalletAccount) => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "GET_ENCRYPTED_PRIVATE_KEY",
    data: { encryptedSecret, account },
  })

  const { encryptedPrivateKey } = await waitForMessage(
    "GET_ENCRYPTED_PRIVATE_KEY_RES",
  )

  return await decryptFromBackground(encryptedPrivateKey, secret)
}

export const getPublicKey = async (account?: BaseWalletAccount) => {
  sendMessage({
    type: "GET_PUBLIC_KEY",
    data: account,
  })

  const { publicKey } = await waitForMessage("GET_PUBLIC_KEY_RES")

  return publicKey
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

export const accountChangeGuardian = async (
  account: BaseWalletAccount,
  guardian: string | undefined,
) => {
  sendMessage({ type: "ACCOUNT_CHANGE_GUARDIAN", data: { account, guardian } })

  const result = await Promise.race([
    waitForMessage("ACCOUNT_CHANGE_GUARDIAN_RES"),
    waitForMessage("ACCOUNT_CHANGE_GUARDIAN_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}

export const accountCancelEscape = async (account: BaseWalletAccount) => {
  sendMessage({ type: "ACCOUNT_CANCEL_ESCAPE", data: { account } })

  const result = await Promise.race([
    waitForMessage("ACCOUNT_CANCEL_ESCAPE_RES"),
    waitForMessage("ACCOUNT_CANCEL_ESCAPE_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}

export const accounTriggerEscapeGuardian = async (
  account: BaseWalletAccount,
) => {
  sendMessage({ type: "ACCOUNT_TRIGGER_ESCAPE_GUARDIAN", data: { account } })

  const result = await Promise.race([
    waitForMessage("ACCOUNT_TRIGGER_ESCAPE_GUARDIAN_RES"),
    waitForMessage("ACCOUNT_TRIGGER_ESCAPE_GUARDIAN_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}

export const accountEscapeAndChangeGuardian = async (
  account: BaseWalletAccount,
) => {
  sendMessage({ type: "ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN", data: { account } })

  const result = await Promise.race([
    waitForMessage("ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN_RES"),
    waitForMessage("ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}
