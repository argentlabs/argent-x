import { Account, number } from "starknet"

const nonceStore: Record<string, string> = {}

export async function getNonce(account: Account): Promise<string> {
  const result = await account.getNonce()
  const nonceBn = number.toBN(result)
  const storedNonce = nonceStore[account.address]

  // If there's no nonce stored or the fetched nonce is bigger than the stored one, store the fetched nonce
  if (!storedNonce || nonceBn.gt(number.toBN(storedNonce))) {
    nonceStore[account.address] = number.toHex(nonceBn)
  }

  // If the stored nonce is greater than the fetched nonce, use the stored nonce
  if (storedNonce && number.toBN(storedNonce).gt(nonceBn)) {
    return number.toHex(number.toBN(storedNonce))
  }

  // else return the fetched nonce
  return number.toHex(nonceBn)
}

export function increaseStoredNonce(address: string): void {
  const currentNonce = nonceStore[address]
  if (currentNonce) {
    nonceStore[address] = number.toHex(
      number.toBN(currentNonce).add(number.toBN(1)),
    )
  }
}

export function resetStoredNonce(address: string): void {
  delete nonceStore[address]
}
