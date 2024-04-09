import { AnalyticsService } from "../../../../shared/analytics/implementation"
import { IBackgroundUIService } from "../ui/interface"
import { onOpen } from "../worker/schedule/decorators"
import { pipe } from "../worker/schedule/pipe"

export class AnalyticsWoker {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly backgroundUIService: IBackgroundUIService,
  ) {}

  onClose = pipe(onOpen(this.backgroundUIService))(async () => {
    this.analyticsService.applicationOpened()
  })
}
