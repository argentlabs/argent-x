import type {
  CairoVersion,
  DeployAccountContractPayload as StarknetDeployAccountContractPayload,
  InvocationsDetails as StarknetInvocationDetails,
} from "starknet"
import type {
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  SignerType,
  WalletAccount,
} from "../../../shared/wallet.model"
import type { Address, Hex } from "@argent/x-shared"
import type { EstimatedFeeV2 } from "@argent/x-shared/simulation"

// Extend to support multichain
type InvocationsDetails = StarknetInvocationDetails
export type DeployAccountContractPayload =
  StarknetDeployAccountContractPayload & {
    version: CairoVersion
  }

export interface IWalletDeploymentService {
  deployAccount(
    walletAccount: WalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ): Promise<{ account: WalletAccount; txHash: string }>
  getDeployAccountTransactionHash(
    walletAccount: WalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ): Promise<Hex>
  getAccountDeploymentFee(
    walletAccount: WalletAccount,
    feeTokenAddress?: Address,
  ): Promise<EstimatedFeeV2>
  getAccountDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>>
  newAccount(
    networkId: string,
    accountType?: CreateAccountType, // Should not be able to create plugin accounts. Default to argent account
    signerType?: SignerType,
    multisigPayload?: MultisigData,
  ): Promise<CreateWalletAccount>
  getMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>>
  getAccountOrMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>>
}
