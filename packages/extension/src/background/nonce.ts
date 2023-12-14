import { num, Account } from "starknet"

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
  const result = await starknetAccount.getNonce()
  const nonceBn = num.toBigInt(result)
  const storedNonce = await nonceStore.get(storageAddress)

  if (account.type === "multisig") {
    // If the account is a multisig, we don't want to store the nonce
    return num.toHex(nonceBn)
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
