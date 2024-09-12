import { Network } from "../src/shared/network"
import { ETH_TOKEN_ADDRESS } from "../src/shared/network/constants"
import {
  ArgentAccountType,
  SignerType,
  WalletAccount,
  WalletAccountSigner,
} from "../src/shared/wallet.model"

const defaultNetwork: Network = {
  id: "localhost",
  name: "localhostNetwork",
  chainId: "1",
  possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
  rpcUrl: "rpcUrl",
}
const defaultSigner: WalletAccountSigner = {
  type: SignerType.LOCAL_SECRET,
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
  salt: "0x0",
}

export const getMockWalletAccount = (overrides?: Partial<WalletAccount>) => ({
  ...defaultWalletAccount,
  ...(overrides ?? {}),
})
