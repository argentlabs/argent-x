import { TXV3_ACCOUNT_CLASS_HASH } from "@argent/x-shared"
import type { Network } from "../src/shared/network"
import { ETH_TOKEN_ADDRESS } from "../src/shared/network/constants"
import type {
  ArgentAccountType,
  ArgentWalletAccount,
  WalletAccount,
  WalletAccountSigner,
} from "../src/shared/wallet.model"
import { SignerType } from "../src/shared/wallet.model"

const defaultNetwork: Network = {
  id: "localhost",
  name: "localhostNetwork",
  chainId: "1",
  possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
  rpcUrl: "rpcUrl",
}
const defaultSigner: WalletAccountSigner = {
  type: SignerType.LOCAL_SECRET,
  derivationPath: "m/44'/9004'/0'/0/0",
}
const defaultName = "Account 1"
const defaultAccountType: ArgentAccountType = "standard"
const defaultAddress = "0x0"

const defaultId = `${defaultAddress}-${defaultNetwork.id}-${defaultSigner.type}`

const defaultWalletAccount: WalletAccount = {
  id: defaultId,
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
  classHash: TXV3_ACCOUNT_CLASS_HASH,
}

export const getMockWalletAccount = (overrides?: Partial<WalletAccount>) => ({
  ...defaultWalletAccount,
  ...(overrides ?? {}),
})

export const getMockArgentWalletAccount = (
  overrides?: Partial<ArgentWalletAccount>,
): ArgentWalletAccount => ({
  ...defaultWalletAccount,
  type: "standard",
  ...(overrides ?? {}),
})
