import {
  simulateAndReviewSchema,
  type SimulateAndReview,
} from "@argent/x-shared/simulation"
import type { ActionHash } from "../../../shared/actionQueue/schema"
import type {
  ApproveActionInput,
  IActionService,
} from "../../../shared/actionQueue/service/IActionService"
import { messageClient } from "../trpc"

export class ClientActionService implements IActionService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  approve(approveActionInput: ApproveActionInput) {
    return this.trpcClient.action.approve.mutate(approveActionInput)
  }

  approveAndWait(approveActionInput: ApproveActionInput) {
    return this.trpcClient.action.approveAndWait.mutate(approveActionInput)
  }

  reject(actionHash: ActionHash | ActionHash[]) {
    return this.trpcClient.action.reject.mutate(actionHash)
  }

  rejectAll() {
    return this.trpcClient.action.rejectAll.mutate()
  }

  updateTransactionReview({
    actionHash,
    transactionReview,
  }: {
    actionHash: ActionHash
    transactionReview: SimulateAndReview
  }) {
    const parsed = simulateAndReviewSchema.parse(transactionReview)
    return this.trpcClient.action.updateTransactionReview.mutate({
      actionHash,
      transactionReview: parsed,
    })
  }

  clearActionError(actionHash: ActionHash) {
    return this.trpcClient.action.clearActionError.mutate(actionHash)
  }
}
