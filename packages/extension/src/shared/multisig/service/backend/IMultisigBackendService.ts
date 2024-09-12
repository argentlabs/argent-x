import { InvokeFunctionResponse } from "starknet"
import { BaseWalletAccount } from "../../../wallet.model"
import {
  ApiMultisigAccountData,
  ApiMultisigDataForSigner,
  ApiMultisigGetSignatureRequestById,
  ApiMultisigGetSignatureRequests,
  ApiMultisigGetTransactionRequests,
  MultisigSignerSignaturesWithId,
} from "../../multisig.model"
import {
  ICreateTransactionRequest,
  IAddRequestSignature,
  IFetchMultisigDataForSigner,
  ICreateOffchainSignatureRequest,
  IAddOffchainSignature,
  IFetchMultisigOffchainSignatureRequestById,
  ICancelOffchainSignature,
} from "./types"
import { Network } from "../../../network"

export interface IMultisigBackendService {
  fetchMultisigDataForSigner(
    payload: IFetchMultisigDataForSigner,
  ): Promise<ApiMultisigDataForSigner>

  fetchMultisigAccountData(
    payload: BaseWalletAccount,
  ): Promise<ApiMultisigAccountData>

  fetchMultisigTransactionRequests(
    payload: BaseWalletAccount,
  ): Promise<ApiMultisigGetTransactionRequests>

  fetchMultisigSignatureRequests(
    payload: BaseWalletAccount,
  ): Promise<ApiMultisigGetSignatureRequests>

  fetchMultisigSignatureRequestById(
    payload: IFetchMultisigOffchainSignatureRequestById,
  ): Promise<ApiMultisigGetSignatureRequestById>

  createTransactionRequest(
    payload: ICreateTransactionRequest,
  ): Promise<InvokeFunctionResponse> // returns the transaction hash of the new transaction

  addTransactionSignature(
    payload: IAddRequestSignature,
  ): Promise<InvokeFunctionResponse> // returns the transaction hash of the new transaction

  createOffchainSignatureRequest(
    payload: ICreateOffchainSignatureRequest,
  ): Promise<MultisigSignerSignaturesWithId> // returns the transaction hash of the new transaction

  addOffchainSignature(
    payload: IAddOffchainSignature,
  ): Promise<MultisigSignerSignaturesWithId> // returns the transaction hash of the new transaction

  cancelOffchainSignature(payload: ICancelOffchainSignature): Promise<void>
  discoverMultisigs(
    network: Network,
    pubKeys: string[],
  ): Promise<ApiMultisigDataForSigner>
}
