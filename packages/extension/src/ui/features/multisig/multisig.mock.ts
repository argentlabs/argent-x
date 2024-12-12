import type { Abi } from "starknet"
import { Contract } from "starknet"

import ArgentCompiledContractAbi from "../../../abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../../../abis/Proxy.json"
import type { Network } from "../../../shared/network"
import { getProvider } from "../../../shared/network"
import type {
  ArgentAccountType,
  WalletAccountSigner,
} from "../../../shared/wallet.model"
import { SignerType } from "../../../shared/wallet.model"
import type { Multisig } from "./Multisig"
import { ETH_TOKEN_ADDRESS } from "../../../shared/network/constants"

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
const defaultMultisigType: ArgentAccountType = "multisig"
const defaultFn = () => undefined
const defaultNeedsDeploy = false
const defaultAddress = "0x0"
const defaultHidden = false
const defaultName = "Multisig 1"
const defaultId = `${defaultAddress}-${defaultNetwork.id}-${defaultSigner.type}`

const defaultMultisig: Multisig = {
  id: defaultId,
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
    id: defaultId,
    name: defaultName,
    networkId: defaultNetwork.id,
    address: defaultAddress,
    network: defaultNetwork,
    signer: defaultSigner,
    type: defaultMultisigType,
    needsDeploy: defaultNeedsDeploy,
  }),
  toBaseWalletAccount: () => ({
    id: defaultId,
    networkId: defaultNetwork.id,
    address: defaultAddress,
  }),
  signers: ["0x0", "0x1"],
  threshold: 2,
  toBaseMultisigAccount: () => ({
    id: defaultId,
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
