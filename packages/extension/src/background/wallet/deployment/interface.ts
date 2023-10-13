import {
  DeployAccountContractPayload as StarknetDeployAccountContractPayload,
  EstimateFee as StarknetEstimateFee,
  InvocationsDetails as StarknetInvocationDetails,
} from "starknet"
import {
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  WalletAccount,
} from "../../../shared/wallet.model"

// Extend to support multichain
type InvocationsDetails = StarknetInvocationDetails
type EstimateFee = StarknetEstimateFee
type DeployAccountContractPayload = StarknetDeployAccountContractPayload

export interface IWalletDeploymentService {
  deployAccount(
    walletAccount: WalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ): Promise<{ account: WalletAccount; txHash: string }>
  getAccountDeploymentFee(walletAccount: WalletAccount): Promise<EstimateFee>
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
}
