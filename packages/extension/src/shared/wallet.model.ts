export interface WalletAccountSigner {
  type: string
  derivationPath: string
}

export interface WalletAccount {
  address: string
  network: string
  signer: WalletAccountSigner
}
