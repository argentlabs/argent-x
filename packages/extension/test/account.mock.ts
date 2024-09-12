import { Abi, Contract } from "starknet"

import { ETH_TOKEN_ADDRESS, TXV3_ACCOUNT_CLASS_HASH } from "@argent/x-shared"
import ArgentCompiledContractAbi from "../src/abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../src/abis/Proxy.json"
import { Network, getProvider } from "../src/shared/network"
import {
  ArgentAccountType,
  SignerType,
  WalletAccountSigner,
} from "../src/shared/wallet.model"
import { Account } from "../src/ui/features/accounts/Account"

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
const defaultAccountType: ArgentAccountType = "standard"
const defaultFn = () => undefined
const defaultNeedsDeploy = false
const defaultAddress = "0x0"
const defaultHidden = false
const defaultName = "Account 1"

const defaultAccount: Account = {
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
    name: defaultName,
    networkId: defaultNetwork.id,
    address: defaultAddress,
    network: defaultNetwork,
    signer: defaultSigner,
    type: defaultAccountType,
    needsDeploy: defaultNeedsDeploy,
  }),
  toBaseWalletAccount: () => ({
    networkId: defaultNetwork.id,
    address: defaultAddress,
  }),
}

export const getMockAccount = (overrides?: Partial<Account>) => ({
  ...defaultAccount,
  ...(overrides || {}),
})
