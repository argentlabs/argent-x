import { WalletAccountSigner } from "./wallet.model"

// from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2645.md
// m / purpose' / layer' / application' / eth_address_1' / eth_address_2' / index

export const baseDerivationPath = "m/44'/9004'/0'/0"

interface WithSigner {
  signer: WalletAccountSigner
}

export const hasLatestDerivationPath = ({ signer }: WithSigner) =>
  signer.derivationPath?.startsWith(baseDerivationPath)
