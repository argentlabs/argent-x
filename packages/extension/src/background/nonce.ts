import { number } from "starknet"

import { BaseWalletAccount } from "../shared/wallet.model"
import { getAccountIdentifier } from "../shared/wallet.service"
import { Wallet } from "./wallet"

const nonceStore: Record<string, string> = {}

export async function getNonce(
  baseWallet: BaseWalletAccount,
  wallet: Wallet,
): Promise<string> {
  const account = await wallet.getStarknetAccount(baseWallet)
  const storageAddress = getAccountIdentifier(baseWallet)
  const result = await account.getNonce()
  const nonceBn = number.toBN(result)
  const storedNonce = nonceStore[storageAddress]

  // If there's no nonce stored or the fetched nonce is bigger than the stored one, store the fetched nonce
  if (!storedNonce || nonceBn.gt(number.toBN(storedNonce))) {
    nonceStore[storageAddress] = number.toHex(nonceBn)
  }

  // If the stored nonce is greater than the fetched nonce, use the stored nonce
  if (storedNonce && number.toBN(storedNonce).gt(nonceBn)) {
    return number.toHex(number.toBN(storedNonce))
  }

  // else return the fetched nonce
  return number.toHex(nonceBn)
}

export function increaseStoredNonce(account: BaseWalletAccount): void {
  const storageAddress = getAccountIdentifier(account)
  const currentNonce = nonceStore[storageAddress]
  if (currentNonce) {
    nonceStore[storageAddress] = number.toHex(
      number.toBN(currentNonce).add(number.toBN(1)),
    )
  }
}

export function resetStoredNonce(account: BaseWalletAccount): void {
  const storageAddress = getAccountIdentifier(account)
  delete nonceStore[storageAddress]
}
