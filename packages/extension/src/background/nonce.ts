import { Account, num } from "starknet"
import { argentMultisigBackendService } from "../shared/multisig/service/backend"
import { KeyValueStorage } from "../shared/storage"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import { getAccountIdentifier } from "../shared/wallet.service"

const nonceStore = new KeyValueStorage<Record<string, string>>(
  {},
  {
    namespace: "core:nonceManager",
    areaName: "session",
  },
)

export async function getNonce(
  account: WalletAccount,
  starknetAccount: Account,
): Promise<string> {
  const storageAddress = getAccountIdentifier(account)
  let nonceBn = BigInt(0)

  try {
    const result = await starknetAccount.getNonce()
    nonceBn = num.toBigInt(result)
  } catch {
    console.warn("Onchain getNonce failed, using stored nonce.")
  }

  const storedNonce = await nonceStore.get(storageAddress)

  if (account.type === "multisig") {
    // Get the pending transactions from BE and take them into account when calculating the nonce
    const { content } =
      await argentMultisigBackendService.fetchMultisigTransactionRequests({
        address: account.address,
        networkId: account.network.id,
      })

    const maxNonce = content
      .map((tx) => tx.nonce)
      .reduce((a, b) => Math.max(a, b), 0)

    // Increment the nonce by 1 if there are pending transactions
    const nonceForPendingTransactions = content.length ? maxNonce + 1 : nonceBn
    // If the account is a multisig, we don't want to store the nonce
    return num.toHex(nonceForPendingTransactions)
  }

  // If there's no nonce stored or the fetched nonce is bigger than the stored one, store the fetched nonce
  if (!storedNonce || nonceBn > num.toBigInt(storedNonce)) {
    await nonceStore.set(storageAddress, num.toHex(nonceBn))
  }

  // If the stored nonce is greater than the fetched nonce, use the stored nonce
  if (storedNonce && num.toBigInt(storedNonce) > nonceBn) {
    return num.toHex(storedNonce)
  }

  // else return the fetched nonce
  return num.toHex(nonceBn)
}

export async function increaseStoredNonce(
  account: BaseWalletAccount,
): Promise<void> {
  const storageAddress = getAccountIdentifier(account)
  const storedNonce = await nonceStore.get(storageAddress)
  if (storedNonce) {
    await nonceStore.set(
      storageAddress,
      num.toHex(num.toBigInt(storedNonce) + num.toBigInt(1)),
    )
  }
}

export async function resetStoredNonce(
  account: BaseWalletAccount,
): Promise<void> {
  const storageAddress = getAccountIdentifier(account)
  await nonceStore.delete(storageAddress)
}
