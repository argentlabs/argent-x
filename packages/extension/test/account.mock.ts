import type { Abi } from "starknet"
import { Contract } from "starknet"

import { ETH_TOKEN_ADDRESS, TXV3_ACCOUNT_CLASS_HASH } from "@argent/x-shared"
import ArgentCompiledContractAbi from "../src/abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../src/abis/Proxy.json"
import type { Network } from "../src/shared/network"
import { getProvider } from "../src/shared/network"
import type {
  ArgentAccountType,
  WalletAccountSigner,
} from "../src/shared/wallet.model"
import { SignerType } from "../src/shared/wallet.model"
import type { Account } from "../src/ui/features/accounts/Account"

const defaultNetwork: Network = {
  id: "localhost",
  name: "localhostNetwork",
  chainId: "1",
  possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
  rpcUrl: "rpcUrl",
}
const defaultSigner: WalletAccountSigner = {
  type: SignerType.LOCAL_SECRET,
  derivationPath: "m/44'/60'/0'/0/0",
}
const defaultAccountType: ArgentAccountType = "standard"
const defaultFn = () => undefined
const defaultNeedsDeploy = false
const defaultAddress = "0x0"
const defaultHidden = false
const defaultName = "Account 1"
const defaultId = `${defaultAddress}-${defaultNetwork.id}-${defaultSigner.type}`

const defaultAccount: Account = {
  id: defaultId,
  name: defaultName,
  address: defaultAddress,
  classHash: TXV3_ACCOUNT_CLASS_HASH,
  network: defaultNetwork,
  networkId: defaultNetwork.id,
  signer: defaultSigner,
  type: defaultAccountType,
  guardian: undefined,
  contract: new Contract(
    ArgentCompiledContractAbi as Abi,
    defaultAddress,
    getProvider(defaultNetwork),
  ),
  proxyContract: new Contract(
    ProxyCompiledContractAbi as Abi,
    defaultAddress,
    getProvider(defaultNetwork),
  ),
  provider: getProvider(defaultNetwork),
  hidden: defaultHidden,
  needsDeploy: defaultNeedsDeploy,
  getCurrentImplementation: defaultFn,
  toWalletAccount: () => ({
    id: defaultId,
    name: defaultName,
    networkId: defaultNetwork.id,
    address: defaultAddress,
    network: defaultNetwork,
    signer: defaultSigner,
    type: defaultAccountType,
    needsDeploy: defaultNeedsDeploy,
  }),
  toBaseWalletAccount: () => ({
    id: defaultId,
    networkId: defaultNetwork.id,
    address: defaultAddress,
  }),
}

export const getMockAccount = (overrides?: Partial<Account>) => ({
  ...defaultAccount,
  ...(overrides || {}),
})

export const getMockSigner = (overrides?: Partial<WalletAccountSigner>) => ({
  ...defaultSigner,
  ...(overrides || {}),
})
