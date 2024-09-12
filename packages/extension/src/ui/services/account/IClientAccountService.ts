import { DeployAccountContractTransaction } from "starknet"
import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  MultisigData,
  SignerType,
  WalletAccount,
} from "../../../shared/wallet.model"

export interface IClientAccountService {
  // selected account
  select(baseAccount: BaseWalletAccount): Promise<void>

  // account methods
  create(
    type: CreateAccountType,
    signerType: SignerType,
    networkId: string,
    multisigPayload?: MultisigData,
  ): Promise<WalletAccount>
  deploy(baseAccount: BaseWalletAccount): Promise<void>
  upgrade(
    baseAccount: BaseWalletAccount,
    targetImplementationType?: ArgentAccountType,
  ): Promise<void>

  getAccountDeploymentPayload(
    baseAccount: BaseWalletAccount,
  ): Promise<DeployAccountContractTransaction>

  getLastUsedAccountOnNetwork(
    networkId: string,
  ): Promise<BaseWalletAccount | undefined>
}
