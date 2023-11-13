import type { IActiveStore } from "../../../../shared/analytics"
import type { IBackgroundUIService } from "../ui/interface"
import { Opened } from "../ui/interface"

export class AnalyticsWorker {
  constructor(
    private readonly activeStore: IActiveStore,
    private readonly backgroundUIService: IBackgroundUIService,
  ) {
    this.backgroundUIService.emitter.on(Opened, (opened) => {
      if (!opened) {
        /** Extension was closed */
        void this.activeStore.update("lastClosed")
      }
    })
  }
}
