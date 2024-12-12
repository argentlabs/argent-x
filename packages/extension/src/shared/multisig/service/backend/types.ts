import type { Address } from "@argent/x-shared"
import type {
  BigNumberish,
  CairoVersion,
  Call,
  InvocationsSignerDetails,
  Signature,
  constants,
} from "starknet"
import type { TypedData } from "@starknet-io/types-js"
import type { Network } from "../../../network"
import type {
  AccountId,
  BaseWalletAccount,
  MultisigWalletAccount,
} from "../../../wallet.model"
import type { ApiMultisigResourceBounds } from "../../multisig.model"
import type { MultisigPendingOffchainSignature } from "../../pendingOffchainSignaturesStore"
import type { MultisigPendingTransaction } from "../../pendingTransactionsStore"

export interface IFetchMultisigDataForSigner {
  signer: string
  network: Network
}

export interface IFetchMultisigOffchainSignatureRequestById {
  address: Address
  requestId: string
  chainId: constants.StarknetChainId
}

export interface ICreateTransactionRequest {
  address: Address
  accountId: AccountId
  calls: Call[]
  transactionDetails: InvocationsSignerDetails
  signature: Signature
}

export interface ICreateOffchainSignatureRequest {
  address: Address
  accountId: AccountId
  data: TypedData
  signature: Signature
  chainId: constants.StarknetChainId
}

export interface IAddOffchainSignature {
  address: Address
  accountId: AccountId
  signature: Signature
  chainId: constants.StarknetChainId
  pendingOffchainSignature: MultisigPendingOffchainSignature
}

export interface ICancelOffchainSignature {
  address: Address
  chainId: constants.StarknetChainId
  pendingOffchainSignature: MultisigPendingOffchainSignature
  signature: Signature
}

export interface IMapTransactionDetails {
  address: Address
  accountId: AccountId
  transactionDetails: InvocationsSignerDetails
}

export interface IAddRequestSignature {
  address: Address
  accountId: AccountId
  transactionToSign: MultisigPendingTransaction
  chainId: constants.StarknetChainId
  signature: Signature
}

export interface MappedTransactionDetails {
  nonce: BigNumberish
  version: BigNumberish
  maxFee: BigNumberish
  starknetNetwork: string
  account: BaseWalletAccount
  chainId: constants.StarknetChainId
  cairoVersion: CairoVersion
  resourceBounds?: ApiMultisigResourceBounds
}

export interface IPrepareTransaction {
  signature: Signature
  mappedDetails: Pick<
    MappedTransactionDetails,
    "nonce" | "version" | "maxFee" | "resourceBounds"
  >
  calls: Call[]
}

export interface IProcessNewTransactionResponse {
  response: unknown
  calls: Call[]
  address: Address
  cairoVersion: CairoVersion
  maxFee: BigNumberish
  chainId: constants.StarknetChainId
  nonce: BigNumberish
  version: BigNumberish
}

export interface IProcessRequestSignatureResponse {
  response: unknown
  multisig: MultisigWalletAccount
  transactionToSign: MultisigPendingTransaction
}
