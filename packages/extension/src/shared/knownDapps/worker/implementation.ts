import { IScheduleService } from "../../schedule/interface"
import { KnownDappService } from "../implementation"
import { RefreshInterval } from "../../config"
import { everyWhenOpen } from "../../../background/__new/services/worker/schedule/decorators"
import { pipe } from "../../../background/__new/services/worker/schedule/pipe"
import { IBackgroundUIService } from "../../../background/__new/services/ui/interface"
import { IDebounceService } from "../../debounce"
// Worker should be in background, not shared, as they are only used in the background
// TODO: move this file

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
