import type { Hex } from "@noble/curves/abstract/utils"
import { bytesToHex } from "@noble/curves/abstract/utils"
import { sha256 } from "@noble/hashes/sha256"
import { encode } from "starknet"
import { grindKey as microGrindKey } from "micro-starknet"
import type {
  CreateAccountType,
  ExternalAccountType,
  SignerType,
  WalletAccountType,
} from "../wallet.model"
import { DERIVATION_PATHS } from "./derivationPaths"
import { assertNever } from "../utils/assertNever"

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
  accountType: CreateAccountType | ExternalAccountType,
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

export const getDerivationPathForIndex = (
  index: number,
  signerType: SignerType,
  accountType: WalletAccountType,
): string => {
  const getDerivableType = (
    accountType: WalletAccountType,
  ): CreateAccountType | ExternalAccountType => {
    switch (accountType) {
      case "standard":
      case "multisig":
      case "smart":
      case "standardCairo0":
      case "imported":
        return accountType
      case "argent5MinuteEscapeTestingAccount":
        return "smart"
      case "plugin":
      case "betterMulticall":
        return "standard"
      default:
        assertNever(accountType)
        throw new Error(`Unsupported account type ${accountType}`)
    }
  }

  const derivableType = getDerivableType(accountType)
  const baseDerivationPath = getBaseDerivationPath(derivableType, signerType)

  return `${baseDerivationPath}/${index}`
}
