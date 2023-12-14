import { Abi, Contract } from "starknet"

import ArgentCompiledContractAbi from "../../../abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../../../abis/Proxy.json"
import { Network, getProvider } from "../../../shared/network"
import {
  ArgentAccountType,
  WalletAccountSigner,
} from "../../../shared/wallet.model"
import { Multisig } from "./Multisig"

const defaultNetwork: Network = {
  id: "localhost",
  name: "localhostNetwork",
  chainId: "1",
  rpcUrl: "rpcUrl",
}
const defaultSigner: WalletAccountSigner = {
  type: "local_secret",
  derivationPath: "derivationPath",
}
const defaultMultisigType: ArgentAccountType = "multisig"
const defaultFn = () => undefined
const defaultNeedsDeploy = false
const defaultAddress = "0x0"
const defaultHidden = false
const defaultName = "Multisig 1"

const defaultMultisig: Multisig = {
  name: defaultName,
  address: defaultAddress,
  network: defaultNetwork,
  networkId: defaultNetwork.id,
  signer: defaultSigner,
  type: defaultMultisigType,
  guardian: undefined,
  provider: getProvider(defaultNetwork),
  hidden: defaultHidden,
  needsDeploy: defaultNeedsDeploy,
  getDeployTransactionStorageKey: () => "key",
  updateDeployTx: defaultFn,
  completeDeployTx: defaultFn,
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
  getCurrentImplementation: defaultFn,
  toWalletAccount: () => ({
    name: defaultName,
    networkId: defaultNetwork.id,
    address: defaultAddress,
    network: defaultNetwork,
    signer: defaultSigner,
    type: defaultMultisigType,
    needsDeploy: defaultNeedsDeploy,
  }),
  toBaseWalletAccount: () => ({
    networkId: defaultNetwork.id,
    address: defaultAddress,
  }),
  signers: ["0x0", "0x1"],
  threshold: 2,
  toBaseMultisigAccount: () => ({
    address: defaultAddress,
    signers: ["0x0", "0x1"],
    threshold: 2,
    networkId: defaultNetwork.id,
    publicKey: "0x0",
    updatedAt: Date.now(),
  }),
  publicKey: "0x0",
  isZeroMultisig: () => false,
  updatedAt: Date.now(),
}

export const getMockMultisig = (overrides: Partial<Multisig>) => ({
  ...defaultMultisig,
  ...overrides,
})
