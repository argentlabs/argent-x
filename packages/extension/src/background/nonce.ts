import { number } from "starknet"

import { KeyValueStorage } from "../shared/storage"
import { BaseWalletAccount } from "../shared/wallet.model"
import { getAccountIdentifier } from "../shared/wallet.service"
import { Wallet } from "./wallet"

const nonceStore = new KeyValueStorage<Record<string, string>>(
  {},
  {
    namespace: "core:nonceManager",
    areaName: "session",
  },
)

export async function getNonce(
  baseWallet: BaseWalletAccount,
  wallet: Wallet,
): Promise<string> {
  const account = await wallet.getStarknetAccount(baseWallet)
  const storageAddress = getAccountIdentifier(baseWallet)
  const result = await account.getNonce()
  const nonceBn = number.toBigInt(result)
  const storedNonce = await nonceStore.get(storageAddress)

  // If there's no nonce stored or the fetched nonce is bigger than the stored one, store the fetched nonce
  if (!storedNonce || nonceBn > number.toBigInt(storedNonce)) {
    await nonceStore.set(storageAddress, number.toHex(nonceBn))
  }

  // If the stored nonce is greater than the fetched nonce, use the stored nonce
  if (storedNonce && number.toBigInt(storedNonce) > nonceBn) {
    return number.toHex(number.toBigInt(storedNonce))
  }

  // else return the fetched nonce
  return number.toHex(nonceBn)
}

export async function increaseStoredNonce(
  account: BaseWalletAccount,
): Promise<void> {
  const storageAddress = getAccountIdentifier(account)
  const storedNonce = await nonceStore.get(storageAddress)
  if (storedNonce) {
    nonceStore.set(
      storageAddress,
      number.toHex(number.toBigInt(storedNonce) + number.toBigInt(1)),
    )
  }
}

export async function resetStoredNonce(
  account: BaseWalletAccount,
): Promise<void> {
  const storageAddress = getAccountIdentifier(account)
  await nonceStore.delete(storageAddress)
}
