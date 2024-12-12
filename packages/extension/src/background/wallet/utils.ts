import type { HDNodeWallet, KeystoreAccount } from "ethers"

export function walletToKeystore(wallet: HDNodeWallet): KeystoreAccount {
  const account: KeystoreAccount = {
    address: wallet.address,
    privateKey: wallet.privateKey,
  }
  const m = wallet.mnemonic
  if (wallet.path && m?.wordlist.locale === "en" && m?.password === "") {
    account.mnemonic = {
      path: wallet.path,
      locale: "en",
      entropy: m.entropy,
    }
  }

  return account
}
