import { sendMessage, waitForMessage } from "../../shared/messages"
import { BaseWalletAccount, WalletAccount } from "../../shared/wallet.model"
import { decryptFromBackground, generateEncryptedSecret } from "./crypto"

/**
 * @deprecated use `accountService` instead
 * @see accountService
 */
export const deployNewMultisig = async (account: BaseWalletAccount) => {
  sendMessage({ type: "DEPLOY_MULTISIG", data: account })

  try {
    await Promise.race([
      waitForMessage("DEPLOY_MULTISIG_RES"),
      waitForMessage("DEPLOY_MULTISIG_REJ").then(() => {
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

export const accountsOnNetwork = (
  accounts: WalletAccount[],
  networkId: string,
) => accounts.filter((account) => account.networkId === networkId)

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

  const { publicKey } = await waitForMessage("GET_PUBLIC_KEY_RES", (x) =>
    account ? x.data.account.address === account.address : true,
  )

  return publicKey
}

export const getNextPublicKey = async (networkId: string) => {
  sendMessage({
    type: "GET_NEXT_PUBLIC_KEY",
    data: { networkId },
  })

  const { publicKey } = await Promise.race([
    waitForMessage("GET_NEXT_PUBLIC_KEY_RES"),
    waitForMessage("GET_NEXT_PUBLIC_KEY_REJ").then(() => {
      throw new Error("Getting next public key failed")
    }),
  ])

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
  guardian: string, // let's make it mandatory
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
