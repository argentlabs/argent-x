import { difference } from "lodash-es"

import type { PreAuthorization } from "../../../../../shared/preAuthorization/schema"
import type { IPreAuthorizationRepo } from "../../../../../shared/preAuthorization/store"
import type { StorageChange } from "../../../../../shared/storage/__new/interface"
import { sendMessageToHost } from "../../../../activeTabs"

export class PreAuthorisationWorker {
  constructor(
    private readonly preAuthorizationRepo: IPreAuthorizationRepo,
    private readonly sendMessageToHostImpl: typeof sendMessageToHost = sendMessageToHost,
  ) {
    this.preAuthorizationRepo.subscribe(
      this.preAuthorizationRepoChanged.bind(this),
    )
  }

  async preAuthorizationRepoChanged(
    changeSet: StorageChange<PreAuthorization[]>,
  ) {
    const removed = difference(
      changeSet.oldValue ?? [],
      changeSet.newValue ?? [],
    )
    for (const preAuthorization of removed) {
      await this.sendMessageToHostImpl(
        {
          type: "DISCONNECT_ACCOUNT",
        },
        preAuthorization.host,
      )
    }
  }
}
