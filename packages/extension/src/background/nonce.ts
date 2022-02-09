import { Signer, number, stark } from "starknet"

const nonceStore: Record<string, string> = {}

export async function getNonce(signer: Signer): Promise<string> {
  const { result } = await signer.callContract({
    contract_address: signer.address,
    entry_point_selector: stark.getSelectorFromName("get_nonce"),
  })
  const nonceBn = number.toBN(result[0])
  const storedNonce = nonceStore[signer.address]

  // If there's no nonce stored or the fetched nonce is bigger than the stored one, store the fetched nonce
  if (!storedNonce || nonceBn.gt(number.toBN(storedNonce))) {
    nonceStore[signer.address] = number.toHex(nonceBn)
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
