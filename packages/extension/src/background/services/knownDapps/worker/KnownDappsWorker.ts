import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { KnownDappService } from "../../../../shared/knownDapps/KnownDappService"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import { pipe } from "../../worker/schedule/pipe"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import type { IDebounceService } from "../../../../shared/debounce"
import { everyWhenOpen } from "../../worker/schedule/decorators"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const id = "knownDappsUpdate"

type Id = typeof id

export class KnownDappsWorker {
  constructor(
    private readonly scheduleService: IScheduleService<Id>,
    private readonly knownDappsService: KnownDappService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly debounceService: IDebounceService,
  ) {}

  update = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.scheduleService,
      this.debounceService,
      RefreshIntervalInSeconds.SLOW,
      "KnownDappsWorker.update",
    ), // This will run the function every 24 hours
  )(async (): Promise<void> => {
    console.log("Updating known dapps data")
    const dapps = await this.knownDappsService.getDapps()

    await this.knownDappsService.upsert(dapps)
  })
}
