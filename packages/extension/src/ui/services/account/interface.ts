import { DeployAccountContractTransaction } from "starknet"
import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  MultisigData,
  WalletAccount,
} from "../../../shared/wallet.model"

export interface IAccountService {
  // selected account
  select(baseAccount: BaseWalletAccount): Promise<void>

  // account methods
  create(
    type: CreateAccountType,
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
}
