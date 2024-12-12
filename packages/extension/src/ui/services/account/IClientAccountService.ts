import type { DeployAccountContractTransaction } from "starknet"
import type {
  AccountId,
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  MultisigData,
  NetworkOnlyPlaceholderAccount,
  SignerType,
  WalletAccount,
} from "../../../shared/wallet.model"
import type { AccountDeployTransaction } from "../../../shared/transactionReview/transactionAction.model"

export interface IClientAccountService {
  // selected account
  select(baseAccount: AccountId | NetworkOnlyPlaceholderAccount): Promise<void>

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

  autoSelectAccountOnNetwork(
    networkId: string,
  ): Promise<BaseWalletAccount | null>

  getAccountDeployTransaction(
    baseAccount: BaseWalletAccount,
  ): Promise<AccountDeployTransaction>
}
