import {
  CairoVersion,
  DeployAccountContractPayload as StarknetDeployAccountContractPayload,
  InvocationsDetails as StarknetInvocationDetails,
} from "starknet"
import {
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  WalletAccount,
} from "../../../shared/wallet.model"
import { EstimatedFee } from "../../../shared/transactionSimulation/fees/fees.model"
import { Address } from "@argent/x-shared"

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
  getAccountDeploymentFee(
    walletAccount: WalletAccount,
    feeTokenAddress?: Address,
  ): Promise<EstimatedFee>
  redeployAccount(
    account: WalletAccount,
  ): Promise<{ account: WalletAccount; txHash: string }>
  getAccountDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>>
  newAccount(
    networkId: string,
    type?: CreateAccountType, // Should not be able to create plugin accounts. Default to argent account
    multisigPayload?: MultisigData,
  ): Promise<CreateWalletAccount>
  getMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>>
  getAccountOrMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>>
}
