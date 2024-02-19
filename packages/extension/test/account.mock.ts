import { Abi, Contract } from "starknet"

import ArgentCompiledContractAbi from "../src/abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../src/abis/Proxy.json"
import { Network, getProvider } from "../src/shared/network"
import {
  ArgentAccountType,
  WalletAccountSigner,
} from "../src/shared/wallet.model"
import { Account } from "../src/ui/features/accounts/Account"
import {
  ETH_TOKEN_ADDRESS,
  TXV3_ACCOUNT_CLASS_HASH,
} from "../src/shared/network/constants"

const defaultNetwork: Network = {
  id: "localhost",
  name: "localhostNetwork",
  chainId: "1",
  possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
  rpcUrl: "rpcUrl",
}
const defaultSigner: WalletAccountSigner = {
  type: "local_secret",
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
  getDeployTransactionStorageKey: () => "key",
  updateDeployTx: defaultFn,
  completeDeployTx: defaultFn,
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

export const getMockAccount = (overrides: Partial<Account>) => ({
  ...defaultAccount,
  ...overrides,
})
