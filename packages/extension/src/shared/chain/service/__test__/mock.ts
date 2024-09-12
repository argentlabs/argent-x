import {
  BaseTransaction,
  TransactionWithStatus,
} from "../../../transactions/interface"
import { IChainService } from "../IChainService"

export class MockChainService implements IChainService {
  constructor(
    private readonly config: {
      deployed: boolean
    },
  ) {}

  async getDeployed(): Promise<boolean> {
    return this.config.deployed
  }

  getTransactionStatus(
    _transaction: BaseTransaction,
  ): Promise<TransactionWithStatus> {
    throw new Error("Method not implemented.")
  }
}

export const mockChainService = new MockChainService({
  deployed: true,
})
