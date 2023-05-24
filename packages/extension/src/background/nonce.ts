import { number } from "starknet"

import { KeyValueStorage } from "../shared/storage"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
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
  account: WalletAccount,
  wallet: Wallet,
): Promise<string> {
  const starknetAccount = await wallet.getStarknetAccount(account)
  const storageAddress = getAccountIdentifier(account)
  const result = await starknetAccount.getNonce()
  const nonceBn = number.toBN(result)
  const storedNonce = await nonceStore.get(storageAddress)

  if (account.type === "multisig") {
    // If the account is a multisig, we don't want to store the nonce
    return number.toHex(nonceBn)
  }

  // If there's no nonce stored or the fetched nonce is bigger than the stored one, store the fetched nonce
  if (!storedNonce || nonceBn.gt(number.toBN(storedNonce))) {
    await nonceStore.set(storageAddress, number.toHex(nonceBn))
  }

  // If the stored nonce is greater than the fetched nonce, use the stored nonce
  if (storedNonce && number.toBN(storedNonce).gt(nonceBn)) {
    return number.toHex(number.toBN(storedNonce))
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
      number.toHex(number.toBN(storedNonce).add(number.toBN(1))),
    )
  }
}

export async function resetStoredNonce(
  account: BaseWalletAccount,
): Promise<void> {
  const storageAddress = getAccountIdentifier(account)
  await nonceStore.delete(storageAddress)
}
