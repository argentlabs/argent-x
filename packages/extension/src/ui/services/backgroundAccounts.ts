import { utils } from "ethers"

import { sendMessage, waitForMessage } from "../../shared/messages"
import {
  ArgentAccountType,
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  CreateAccountType,
  MultisigData,
  WalletAccount,
} from "../../shared/wallet.model"
import { walletStore } from "../../shared/wallet/walletStore"
import { decryptFromBackground, generateEncryptedSecret } from "./crypto"

export const createNewAccount = async (
  networkId: string,
  type?: CreateAccountType,
) => {
  if (type === "multisig") {
    throw new Error(
      "Multisig accounts should be created with createNewMultisigAccount",
    )
  }

  sendMessage({
    type: "NEW_ACCOUNT",
    data: {
      networkId,
      type,
    },
  })
  try {
    return await Promise.race([
      waitForMessage("NEW_ACCOUNT_RES"),
      waitForMessage("NEW_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could not add new account")
  }
}

export const createNewMultisigAccount = async (
  networkId: string,
  multisigPayload: MultisigData,
) => {
  const decodedSigners = multisigPayload.signers.map((signer) =>
    utils.hexlify(utils.base58.decode(signer)),
  )

  sendMessage({
    type: "NEW_MULTISIG_ACCOUNT",
    data: {
      networkId,
      signers: decodedSigners,
      threshold: multisigPayload.threshold,
      creator: multisigPayload.creator,
    },
  })
  try {
    return await Promise.race([
      waitForMessage("NEW_MULTISIG_ACCOUNT_RES"),
      waitForMessage("NEW_MULTISIG_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could not add new account")
  }
}

export const getCalculatedMultisigAddress = async (
  baseMultisigAccount: BaseMultisigWalletAccount,
) => {
  sendMessage({
    type: "GET_CALCULATED_MULTISIG_ADDRESS",
    data: baseMultisigAccount,
  })
  try {
    return await Promise.race([
      waitForMessage("GET_CALCULATED_MULTISIG_ADDRESS_RES"),
      waitForMessage("GET_CALCULATED_MULTISIG_ADDRESS_REJ").then(
        () => "error" as const,
      ),
    ])
  } catch {
    throw Error("Could not calculate multisig account address")
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

export const getAccounts = async (showHidden = false) => {
  sendMessage({ type: "GET_ACCOUNTS", data: { showHidden } })
  return waitForMessage("GET_ACCOUNTS_RES")
}

export const accountsOnNetwork = (
  accounts: WalletAccount[],
  networkId: string,
) => accounts.filter((account) => account.networkId === networkId)

export const selectAccount = async (
  account?: BaseWalletAccount,
): Promise<void> => {
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
