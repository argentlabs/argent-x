import type { Network } from "../../../shared/network"
import type {
  ArgentAccountType,
  MultisigWalletAccount,
  WalletAccountSigner,
} from "../../../shared/wallet.model"
import { SignerType } from "../../../shared/wallet.model"
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
const defaultNeedsDeploy = false
const defaultAddress = "0x0"
const defaultHidden = false
const defaultName = "Multisig 1"
const defaultId = `${defaultAddress}-${defaultNetwork.id}-${defaultSigner.type}`

const defaultMultisig: MultisigWalletAccount = {
  id: defaultId,
  name: defaultName,
  address: defaultAddress,
  network: defaultNetwork,
  networkId: defaultNetwork.id,
  signer: defaultSigner,
  type: defaultMultisigType,
  guardian: undefined,
  hidden: defaultHidden,
  needsDeploy: defaultNeedsDeploy,
  signers: ["0x0", "0x1"],
  threshold: 2,
  publicKey: "0x0",
  updatedAt: Date.now(),
}

export const getMockMultisig = (overrides: Partial<MultisigWalletAccount>) => ({
  ...defaultMultisig,
  ...overrides,
})
