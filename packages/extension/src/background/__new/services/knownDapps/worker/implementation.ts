import { IScheduleService } from "../../../../../shared/schedule/interface"
import { KnownDappService } from "../../../../../shared/knownDapps/implementation"
import { RefreshInterval } from "../../../../../shared/config"
import { pipe } from "../../worker/schedule/pipe"
import { IBackgroundUIService } from "../../ui/interface"
import { IDebounceService } from "../../../../../shared/debounce"
import { everyWhenOpen } from "../../worker/schedule/decorators"

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
      RefreshInterval.VERY_SLOW,
      "KnownDappsWorker.update",
    ), // This will run the function every 24 hours
  )(async (): Promise<void> => {
    console.log("Updating known dapps data")
    const dapps = await this.knownDappsService.getDapps()

    await this.knownDappsService.upsert(dapps)
  })
}
