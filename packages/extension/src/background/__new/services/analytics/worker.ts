import type { IActiveStore } from "../../../../shared/analytics"
import type { IBackgroundUIService } from "../ui/interface"
import { onClose } from "../worker/schedule/decorators"
import { pipe } from "../worker/schedule/pipe"

export class AnalyticsWorker {
  constructor(
    private readonly activeStore: IActiveStore,
    private readonly backgroundUIService: IBackgroundUIService,
  ) {}

  onClose = pipe(onClose(this.backgroundUIService))(async () => {
    await this.activeStore.update("lastClosed")
  })
}
