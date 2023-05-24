import { Network } from "../src/shared/network"
import {
  ArgentAccountType,
  WalletAccount,
  WalletAccountSigner,
} from "../src/shared/wallet.model"

const defaultNetwork: Network = {
  status: "unknown",
  id: "localhost",
  name: "localhostNetwork",
  chainId: "1",
  baseUrl: "baseUrl",
}
const defaultSigner: WalletAccountSigner = {
  type: "local_secret",
  derivationPath: "derivationPath",
}
const defaultAccountType: ArgentAccountType = "standard"
const defaultAddress = "0x0"

const defaultWalletAccount = {
  name: undefined,
  address: defaultAddress,
  network: defaultNetwork,
  networkId: defaultNetwork.id,
  signer: defaultSigner,
  type: defaultAccountType,
  guardian: undefined,
  escape: undefined,
  needsDeploy: false,
  hidden: false,
}

export const getMockWalletAccount = (overrides: Partial<WalletAccount>) => ({
  ...defaultWalletAccount,
  ...overrides,
})
