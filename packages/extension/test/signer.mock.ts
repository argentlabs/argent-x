import type { WalletAccountSigner } from "../src/shared/wallet.model"
import { SignerType } from "../src/shared/wallet.model"

const defaultSigner: WalletAccountSigner = {
  type: SignerType.LOCAL_SECRET,
  derivationPath: "m/44'/60'/0'/0/0",
}

export const getMockSigner = (overrides?: Partial<WalletAccountSigner>) => ({
  ...defaultSigner,
  ...(overrides || {}),
})
