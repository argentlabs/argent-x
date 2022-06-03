import { WalletAccount } from "./wallet.model"

// from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2645.md
// m / purpose' / layer' / application' / eth_address_1' / eth_address_2' / index

export const newBaseDerivationPath = "m/44'/9004'/0'/0"
export const oldBaseDerivationPath = "m/2645'/1195502025'/1148870696'/0'/0'"

export const isDeprecated = ({
  signer,
  network: { accountClassHash },
}: WalletAccount): boolean => {
  console.log(accountClassHash, signer.derivationPath)
  return Boolean(
    accountClassHash &&
      signer.derivationPath?.startsWith(newBaseDerivationPath),
  )
}
