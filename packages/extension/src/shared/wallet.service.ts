import { isEqualAddress } from "@argent/x-shared"
import type {
  BaseWalletAccount,
  SignerType,
  WalletAccount,
} from "./wallet.model"
import { getBaseDerivationPath } from "./signer/utils"

export const DEPRECATED_TX_V0_ACCOUNT_IMPLEMENTATION_CLASS_HASH = [
  "0x01a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f", // Bad old contract - ask Julien about it
  "0x0ebe4b44d154bc07eacad202ee19757cdc73e7d4c672bc20d9031450c6db3ad", // Bad old contract - ask Julien about it
  "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328", // Argent Account Deprecated
  "0x06a1776964b9f991c710bfe910b8b37578b32b26a7dffd1669a1a59ac94bf82f", // Argent Account Deprecated
  "0x07595b4f7d50010ceb00230d8b5656e3c3dd201b6df35d805d3f2988c69a1432", // Argent Account Deprecated
  "0x02c3348ad109f7f3967df6494b3c48741d61675d9a7915b265aa7101a631dc33", // Argent Account Deprecated
]

export const hasNewDerivationPath = (
  signerType: SignerType,
  derivationPath?: string,
): boolean =>
  Boolean(
    derivationPath?.startsWith(getBaseDerivationPath("standard", signerType)),
  )

export const hasMultisigDerivationPath = (
  signerType: SignerType,
  derivationPath?: string,
): boolean =>
  Boolean(
    derivationPath?.startsWith(getBaseDerivationPath("multisig", signerType)),
  )

export const isDeprecated = ({ signer, network }: WalletAccount): boolean => {
  const isOldPathDeprecated =
    Boolean(network.accountClassHash) &&
    !hasNewDerivationPath(signer.type, signer.derivationPath)

  const isNotMultisig = !hasMultisigDerivationPath(
    signer.type,
    signer.derivationPath,
  )

  return isOldPathDeprecated && isNotMultisig
}

export const isDeprecatedTxV0 = (account: WalletAccount): boolean => {
  return (
    !!account.classHash &&
    DEPRECATED_TX_V0_ACCOUNT_IMPLEMENTATION_CLASS_HASH.some(
      (deprecatedClassHash) =>
        isEqualAddress(deprecatedClassHash, account.classHash),
    )
  )
}

export const isEqualWalletAddress = (
  a: BaseWalletAccount,
  b: BaseWalletAccount,
) => {
  try {
    return isEqualAddress(
      a.address.toLowerCase(),
      b.address.toLocaleLowerCase(),
    )
  } catch (e) {
    console.error("~ isEqualWalletAddress", e)
    return false
  }
}

export const isAccountHidden = (account: Pick<WalletAccount, "hidden">) =>
  account.hidden === true

export const getPendingMultisigIdentifier = (pendingMultisig: {
  networkId: string
  publicKey: string
}) => `${pendingMultisig.networkId}::${pendingMultisig.publicKey}`
