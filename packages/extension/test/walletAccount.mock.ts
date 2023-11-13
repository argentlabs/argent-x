import { Network } from "../src/shared/network"
import {
  ArgentAccountType,
  WalletAccount,
  WalletAccountSigner,
} from "../src/shared/wallet.model"

const defaultNetwork: Network = {
  id: "localhost",
  name: "localhostNetwork",
  chainId: "1",
  sequencerUrl: "sequencerUrl",
}
const defaultSigner: WalletAccountSigner = {
  type: "local_secret",
  derivationPath: "derivationPath",
}
const defaultName = "Account 1"
const defaultAccountType: ArgentAccountType = "standard"
const defaultAddress = "0x0"

const defaultWalletAccount: WalletAccount = {
  name: defaultName,
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

export const getMockWalletAccount = (overrides?: Partial<WalletAccount>) => ({
  ...defaultWalletAccount,
  ...(overrides ?? {}),
})
