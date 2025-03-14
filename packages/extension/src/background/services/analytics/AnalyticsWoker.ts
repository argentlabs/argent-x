import type { AnalyticsService } from "../../../shared/analytics/AnalyticsService"
import type { ISettingsStorage } from "../../../shared/settings/types"
import type { KeyValueStorage } from "../../../shared/storage/keyvalue"
import type { IBackgroundUIService } from "../ui/IBackgroundUIService"
import { onOpen } from "../worker/schedule/decorators"
import { pipe } from "../worker/schedule/pipe"

export class AnalyticsWoker {
  constructor(
    private readonly ampli: AnalyticsService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {}

  onClose = pipe(onOpen(this.backgroundUIService))(async () => {
    const sidePanelEnabled = await this.settingsStore.get("sidePanelEnabled")
    this.ampli.applicationOpened({
      "wallet platform": "browser extension",
    })
    if (sidePanelEnabled) {
      this.ampli.sidebarEnabled({
        "wallet platform": "browser extension",
      })
    }
  })
}
