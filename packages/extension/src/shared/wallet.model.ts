export interface WalletAccountSigner {
  type: string
  derivation_path: string
}

export interface WalletAccount {
  address: string
  network: string
  signer: WalletAccountSigner
}
