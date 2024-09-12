import { Hex, bytesToHex } from "@noble/curves/abstract/utils"
import { sha256 } from "@noble/hashes/sha256"
import { encode } from "starknet"
import { grindKey as microGrindKey } from "micro-starknet"
import { CreateAccountType, SignerType } from "../wallet.model"
import { DERIVATION_PATHS } from "./derivationPaths"

const { addHexPrefix } = encode

/**
 * Grinds a private key to a valid Starknet private key
 * @param privateKey
 * @returns Unsantized hex string
 */
export function grindKey(privateKey: Hex): string {
  return addHexPrefix(microGrindKey(privateKey))
}

export function pathHash(name: string): number {
  const bigHash = BigInt.asUintN(
    31,
    BigInt(addHexPrefix(bytesToHex(sha256(name)))),
  )

  return Number(bigHash)
}

export function getBaseDerivationPath(
  accountType: CreateAccountType,
  signerType: SignerType,
): string {
  const path = DERIVATION_PATHS[accountType][signerType]
  if (!path) {
    throw new Error(
      `Derivation path not found for ${accountType} ${signerType}`,
    )
  }
  return path
}
