import { getProvider } from "../../network"
import type { INetworkService } from "../../network/service/INetworkService"
import type {
  BaseTransaction,
  TransactionStatus,
  TransactionWithStatus,
} from "../../transactions/interface"
import type { BaseContract, IChainService } from "./IChainService"
import { isContractDeployed } from "@argent/x-shared"
import { SUCCESS_STATUSES } from "../../transactions"

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
    let isSuccessful = false

    // getTransactionStatus goes straight to the sequencer, hence it's much faster than the RPC nodes
    // because of that we need to wait for the RPC nodes to have a receipt as well
    try {
      if (
        execution_status === "REVERTED" ||
        SUCCESS_STATUSES.includes(finality_status)
      ) {
        // Only get the receipt if the transaction reverted
        const receipt = await provider.getTransactionReceipt(transaction.hash)

        if ("revert_reason" in receipt) {
          error_reason = receipt.revert_reason
        }

        isSuccessful =
          receipt.isSuccess() &&
          SUCCESS_STATUSES.includes(receipt.finality_status)
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
