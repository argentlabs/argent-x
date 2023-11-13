import { IScheduleService } from "../../schedule/interface"
import { KnownDappService } from "../implementation"
import { RefreshInterval } from "../../config"
import {
  every,
  onStartup,
} from "../../../background/__new/services/worker/schedule/decorators"
import { pipe } from "../../../background/__new/services/worker/schedule/pipe"
// Worker should be in background, not shared, as they are only used in the background
// TODO: move this file

const id = "knownDappsUpdate"

type Id = typeof id

export class KnownDappsWorker {
  constructor(
    private readonly scheduleService: IScheduleService<Id>,
    private readonly knownDappsService: KnownDappService,
  ) {}

  update = pipe(
    onStartup(this.scheduleService), // This will run the function on startup
    every(this.scheduleService, RefreshInterval.VERY_SLOW), // This will run the function every 24 hours
  )(async (): Promise<void> => {
    console.log("Updating known dapps data")
    const dapps = await this.knownDappsService.getDapps()

    await this.knownDappsService.upsert(dapps)
  })
}
