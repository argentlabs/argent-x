import { RpcProvider, TransactionStatus as StarknetTxStatus } from "starknet"

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
    let error_reason: string | undefined
    const { finality_status, execution_status } =
      await provider.getTransactionStatus(transaction.hash)

    // TODO: Use constants
    const isFailed =
      execution_status === "REVERTED" || finality_status === "REJECTED"
    const isSuccessful =
      finality_status === "ACCEPTED_ON_L2" ||
      finality_status === "ACCEPTED_ON_L1"

    try {
      if (execution_status === "REVERTED") {
        // Only get the receipt if the transaction reverted
        const receipt = await provider.getTransactionReceipt(transaction.hash)
        error_reason = receipt.revert_reason
      }
    } catch (e) {
      console.warn(
        `Failed to fetch transaction receipt for ${transaction.hash}`,
        e,
      )
    }

    error_reason =
      error_reason ?? "Unknown Error while fetching transaction status"

    const status: TransactionStatus = isFailed
      ? {
          status: "failed",
          reason: new Error(error_reason),
        }
      : isSuccessful
      ? { status: "confirmed" }
      : { status: "pending" }

    return {
      ...transaction,
      status,
    }
  }
}
