import { ActionHash } from "../../../shared/actionQueue/schema"
import type { IActionService } from "../../../shared/actionQueue/service/interface"
import { ExtensionActionItem } from "../../../shared/actionQueue/types"
import { messageClient } from "../messaging/trpc"

export class ClientActionService implements IActionService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  approve(action: ExtensionActionItem | ActionHash) {
    return this.trpcClient.action.approve.mutate(action)
  }

  approveAndWait(action: ExtensionActionItem | ActionHash) {
    return this.trpcClient.action.approveAndWait.mutate(action)
  }

  reject(actionHash: ActionHash | ActionHash[]) {
    return this.trpcClient.action.reject.mutate(actionHash)
  }

  rejectAll() {
    return this.trpcClient.action.rejectAll.mutate()
  }
}
