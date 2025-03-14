import type { TransactionActionPayload } from "../../../shared/actionQueue/types"

export interface ITransactionExecutionService {
  execute(payload: TransactionActionPayload): Promise<string>
}
