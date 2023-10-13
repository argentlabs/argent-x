import { Call, InvocationsSignerDetails, Signature, constants } from "starknet"
import { MultisigPendingTransaction } from "../../pendingTransactionsStore"
import { Network } from "../../../network"

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

export interface IAddRequestSignature {
  address: string
  transactionToSign: MultisigPendingTransaction
  chainId: constants.StarknetChainId
  signature: Signature
}
