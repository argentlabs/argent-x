import type {
  IRepository,
  StorageChange,
} from "../../../shared/storage/__new/interface"
import type { INonceManagementWorker } from "./INonceManagementWorker"
import { getChangedStatusTransactions } from "../../../shared/transactions/getChangedStatusTransactions"
import { isEmpty } from "lodash-es"
import type { Transaction } from "../../../shared/transactions"
import type { AccountId } from "../../../shared/wallet.model"
import type { INonceManagementService } from "../INonceManagementService"
import { getTransactionStatus } from "../../../shared/transactions/utils"

export class NonceManagementWorker implements INonceManagementWorker {
  constructor(
    private readonly transactionsRepo: IRepository<Transaction>,
    private readonly nonceManagementService: INonceManagementService,
  ) {
    this.transactionsRepo.subscribe(this.onTransactionRepoChange.bind(this))
  }

  async refreshLocalNonce(accountId: AccountId): Promise<void> {
    return this.nonceManagementService.resetLocalNonce(accountId)
  }

  // @internal Only exposed for testing
  onTransactionRepoChange(changeSet: StorageChange<Transaction[]>) {
    const changedStatusTransactions = getChangedStatusTransactions(changeSet)
    if (!changedStatusTransactions || isEmpty(changedStatusTransactions)) {
      return
    }

    for (const tx of changedStatusTransactions) {
      const { finality_status } = getTransactionStatus(tx)

      if (finality_status === "REJECTED") {
        void this.onRejectedTransaction(tx)
      }
    }
  }

  // @internal Only exposed for testing
  async onRejectedTransaction(rejectedTransaction: Transaction) {
    void this.refreshLocalNonce(rejectedTransaction.account.id)
  }
}
