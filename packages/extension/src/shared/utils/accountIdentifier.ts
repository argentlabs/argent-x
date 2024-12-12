import { addressSchema } from "@argent/x-shared"
import type { AccountId, WalletAccountSigner } from "../wallet.model"
import { accountIdSchema, SignerType } from "../wallet.model"
import { getIndexForPathUnsafe } from "./derivationPath"
import { stark } from "starknet"

export function getAccountIdentifier(
  address: string,
  networkId: string,
  signer: WalletAccountSigner,
  parse = true,
): AccountId {
  const addr = parse ? addressSchema.parse(address) : address
  const signerIndex = getIndexForPathUnsafe(signer.derivationPath)
  const id = `${addr}::${networkId}::${signer.type}::${signerIndex}`

  return accountIdSchema.parse(id)
}

// Test util
export function getRandomAccountIdentifier(
  address?: string,
  networkId?: string,
  signer?: WalletAccountSigner,
) {
  address = address ?? stark.randomAddress()
  networkId = networkId ?? "sepolia-alpha"
  const signerType = signer?.type ?? SignerType.LOCAL_SECRET
  const signerIndex = signer?.derivationPath
    ? getIndexForPathUnsafe(signer.derivationPath)
    : 0

  return `${address}::${networkId}::${signerType}::${signerIndex}`
}

export const deserializeAccountIdentifier = (id: AccountId) => {
  const parts = id.split("::")
  if (parts.length !== 4) {
    throw new Error("Invalid account identifier")
  }

  return {
    address: parts[0],
    networkId: parts[1],
    signer: {
      type: parts[2] as SignerType,
      index: parseInt(parts[3]),
    },
  }
}
