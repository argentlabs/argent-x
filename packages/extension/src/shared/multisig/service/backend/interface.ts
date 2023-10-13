import { InvokeFunctionResponse } from "starknet"
import { BaseWalletAccount } from "../../../wallet.model"
import {
  ApiMultisigAccountData,
  ApiMultisigDataForSigner,
  ApiMultisigGetRequests,
} from "../../multisig.model"
import {
  IAddNewTransaction,
  IAddRequestSignature,
  IFetchMultisigDataForSigner,
} from "./types"

export interface IMultisigBackendService {
  fetchMultisigDataForSigner(
    payload: IFetchMultisigDataForSigner,
  ): Promise<ApiMultisigDataForSigner>

  fetchMultisigAccountData(
    payload: BaseWalletAccount,
  ): Promise<ApiMultisigAccountData>

  fetchMultisigRequests(
    payload: BaseWalletAccount,
  ): Promise<ApiMultisigGetRequests>

  addNewTransaction(
    payload: IAddNewTransaction,
  ): Promise<InvokeFunctionResponse> // returns the transaction hash of the new transaction

  addRequestSignature(
    payload: IAddRequestSignature,
  ): Promise<InvokeFunctionResponse> // returns the transaction hash of the new transaction
}
