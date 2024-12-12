import type { AnalyticsService } from "../../../shared/analytics/AnalyticsService"
import type { IBackgroundUIService } from "../ui/IBackgroundUIService"
import { onOpen } from "../worker/schedule/decorators"
import { pipe } from "../worker/schedule/pipe"

export class AnalyticsWoker {
  constructor(
    private readonly ampli: AnalyticsService,
    private readonly backgroundUIService: IBackgroundUIService,
  ) {}

  onClose = pipe(onOpen(this.backgroundUIService))(async () => {
    this.ampli.applicationOpened({
      "wallet platform": "browser extension",
    })
  })
}
