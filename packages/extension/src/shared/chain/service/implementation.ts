import { TransactionStatus as StarknetTxStatus } from "starknet"

import { getProvider } from "../../network"
import { INetworkService } from "../../network/service/interface"
import {
  BaseTransaction,
  TransactionStatus,
  TransactionWithStatus,
} from "../../transactions/interface"
import { BaseContract, IChainService } from "./interface"
import { isContractDeployed } from "@argent/shared"

function starknetStatusToTransactionStatus<T extends StarknetTxStatus>(
  status: T,
  error: T extends "REJECTED" | "REVERTED" ? () => Error : never,
): TransactionStatus {
  switch (status) {
    case StarknetTxStatus.RECEIVED:
      return { status: "pending" }
    case StarknetTxStatus.ACCEPTED_ON_L2:
    case StarknetTxStatus.ACCEPTED_ON_L1:
      return { status: "confirmed" }
    case StarknetTxStatus.REJECTED:
    case StarknetTxStatus.REVERTED:
      return { status: "failed", reason: error() }
    default:
      throw new Error(`Unknown status: ${status}`)
  }
}

export class StarknetChainService implements IChainService {
  constructor(private networkService: Pick<INetworkService, "getById">) {}

  async getDeployed(contract: BaseContract): Promise<boolean> {
    const network = await this.networkService.getById(contract.networkId)
    const provider = getProvider(network)
    const contractFound = await isContractDeployed(provider, contract.address)
    return contractFound
  }

  async getTransactionStatus(
    transaction: BaseTransaction,
  ): Promise<TransactionWithStatus> {
    const network = await this.networkService.getById(transaction.networkId)
    const provider = getProvider(network)
    const receipt = await provider.getTransactionReceipt(transaction.hash)
    let error_reason: string | undefined

    if (!receipt.status) {
      throw new Error("Invalid response from Starknet node")
    }

    if ("revert_reason" in receipt) {
      error_reason = receipt.revert_reason
    }

    if ("transaction_failure_reason" in receipt) {
      error_reason = receipt.transaction_failure_reason.error_message
    }

    const status = starknetStatusToTransactionStatus(
      receipt.status as StarknetTxStatus,
      () => new Error(error_reason),
    )
    return {
      ...transaction,
      status,
    }
  }
}
