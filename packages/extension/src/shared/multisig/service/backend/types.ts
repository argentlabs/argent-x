import {
  BigNumberish,
  CairoVersion,
  Call,
  InvocationsSignerDetails,
  Signature,
  constants,
} from "starknet"
import { MultisigPendingTransaction } from "../../pendingTransactionsStore"
import { Network } from "../../../network"
import { BaseWalletAccount, MultisigWalletAccount } from "../../../wallet.model"

export interface IFetchMultisigDataForSigner {
  signer: string
  network: Network
}

export interface IAddNewTransaction {
  address: string
  calls: Call[]
  transactionDetails: InvocationsSignerDetails
  signature: Signature
}

export interface IMapTransactionDetails {
  address: string
  transactionDetails: InvocationsSignerDetails
}

export interface IAddRequestSignature {
  address: string
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
}

export interface IPrepareTransaction {
  signature: Signature
  mappedDetails: Pick<MappedTransactionDetails, "nonce" | "version" | "maxFee">
  calls: Call[]
}

export interface IProcessNewTransactionResponse {
  response: unknown
  calls: Call[]
  address: string
  cairoVersion: CairoVersion
  maxFee: BigNumberish
  chainId: constants.StarknetChainId
  nonce: BigNumberish
  version: BigNumberish
}

export interface IProcessRequestSignatureResponse {
  response: unknown
  multisig: MultisigWalletAccount
  address: string
  networkId: string
  transactionToSign: MultisigPendingTransaction
}
