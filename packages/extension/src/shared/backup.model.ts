export interface BackupWalletSigner {
  type: string
  derivation_path: string
}

export interface BackupWallet {
  address: string
  network: string
  signer: BackupWalletSigner
}
