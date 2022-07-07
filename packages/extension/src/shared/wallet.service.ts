import { BigNumber } from "ethers"

import { BaseWalletAccount, WalletAccount } from "./wallet.model"

// from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2645.md
// m / purpose' / layer' / application' / eth_address_1' / eth_address_2' / index

export const baseDerivationPath = "m/44'/9004'/0'/0"

export const hasNewDerivationPath = (derivationPath?: string): boolean =>
  Boolean(derivationPath?.startsWith(baseDerivationPath))

export const isDeprecated = ({ signer, network }: WalletAccount): boolean => {
  return (
    Boolean(network.accountClassHash) &&
    !hasNewDerivationPath(signer.derivationPath)
  )
}

export const accountsEqual = (a: BaseWalletAccount, b: BaseWalletAccount) => {
  try {
    return (
      BigNumber.from(a.address.toLowerCase()).eq(
        BigNumber.from(b.address.toLowerCase()),
      ) && a.networkId === b.networkId
    )
  } catch (e) {
    console.error("~ accountsEqual", e)
    return false
  }
}

export const getAccountIdentifier = (account: BaseWalletAccount) =>
  `${account.networkId}::${account.address}`
