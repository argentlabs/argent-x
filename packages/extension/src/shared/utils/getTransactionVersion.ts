import { Address } from "@argent/x-shared"
import { feeTokenNeedsTxV3Support } from "../network/txv3"
import {
  TransactionInvokeVersion,
  TransactionSimulationVersion,
} from "./transactionVersion"
import { DeclareContractPayload, isSierra } from "starknet"

export function getTxVersionFromFeeToken(
  feeTokenAddress: Address,
): TransactionInvokeVersion {
  return feeTokenNeedsTxV3Support({
    address: feeTokenAddress,
  })
    ? "0x3"
    : "0x1"
}

export function getSimulationTxVersionFromFeeToken(
  feeTokenAddress: Address,
): TransactionSimulationVersion {
  return feeTokenNeedsTxV3Support({ address: feeTokenAddress })
    ? "0x100000000000000000000000000000003"
    : "0x100000000000000000000000000000001"
}

// Declare contract specifics
export function getTxVersionFromFeeTokenForDeclareContract(
  feeTokenAddress: Address,
  payload: DeclareContractPayload,
): TransactionInvokeVersion {
  if (!isSierra(payload.contract)) {
    return "0x1"
  }

  return feeTokenNeedsTxV3Support({ address: feeTokenAddress }) ? "0x3" : "0x2"
}
