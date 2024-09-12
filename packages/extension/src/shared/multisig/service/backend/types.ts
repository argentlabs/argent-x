import { Address } from "@argent/x-shared"
import {
  BigNumberish,
  CairoVersion,
  Call,
  InvocationsSignerDetails,
  Signature,
  constants,
} from "starknet"
import { TypedData } from "@starknet-io/types-js"
import { Network } from "../../../network"
import { BaseWalletAccount, MultisigWalletAccount } from "../../../wallet.model"
import { ApiMultisigResourceBounds } from "../../multisig.model"
import { MultisigPendingOffchainSignature } from "../../pendingOffchainSignaturesStore"
import { MultisigPendingTransaction } from "../../pendingTransactionsStore"

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
  calls: Call[]
  transactionDetails: InvocationsSignerDetails
  signature: Signature
}

export interface ICreateOffchainSignatureRequest {
  address: Address
  data: TypedData
  signature: Signature
  chainId: constants.StarknetChainId
}

export interface IAddOffchainSignature {
  address: Address
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
  transactionDetails: InvocationsSignerDetails
}

export interface IAddRequestSignature {
  address: Address
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
