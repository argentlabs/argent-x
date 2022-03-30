import { SignerInterface } from "starknet"

export interface WalletAccountSigner {
  type: string
  derivationPath: string
  signer: SignerInterface
}

export interface WalletAccount {
  address: string
  network: string
  signer: WalletAccountSigner
}
