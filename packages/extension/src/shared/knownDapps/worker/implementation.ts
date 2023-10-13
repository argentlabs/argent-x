import { IScheduleService } from "../../schedule/interface"
import { KnownDappService } from "../implementation"
import { RefreshInterval } from "../../config"

const id = "knownDappsUpdate"

type Id = typeof id

export class KnownDappsWorker {
  constructor(
    private readonly scheduleService: IScheduleService<Id>,
    private readonly knownDappsService: KnownDappService,
  ) {
    void this.scheduleService.registerImplementation({
      id,
      callback: this.update.bind(this),
    })

    // Run once on startup
    void this.update()

    // And then every 24 hours
    void this.scheduleService.every(RefreshInterval.VERY_SLOW, { id })
  }

  async update(): Promise<void> {
    console.log("Updating known dapps data")
    const dapps = await this.knownDappsService.getDapps()

    await this.knownDappsService.upsert(dapps)
  }
}
