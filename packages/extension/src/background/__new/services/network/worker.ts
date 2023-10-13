import { IScheduleService } from "../../../../shared/schedule/interface"
import { IBackgroundUIService, Opened } from "../ui/interface"
import { IBackgroundNetworkService } from "./interface"
import { RefreshInterval } from "../../../../shared/config"

const TASK_ID = "NetworkWorker.updateStatuses"
const REFRESH_PERIOD_MINUTES = Math.floor(RefreshInterval.MEDIUM / 60)

export class NetworkWorker {
  private isUpdating = false
  private lastUpdatedTimestamp = 0

  constructor(
    private readonly backgroundNetworkService: IBackgroundNetworkService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly scheduleService: IScheduleService<typeof TASK_ID>,
  ) {
    void this.scheduleService.registerImplementation({
      id: TASK_ID,
      callback: this.updateNetworkStatuses.bind(this),
    })

    this.backgroundUIService.emitter.on(Opened, this.onOpened.bind(this))
  }

  async updateNetworkStatuses() {
    if (this.isUpdating) {
      return
    }
    this.isUpdating = true
    this.lastUpdatedTimestamp = Date.now()
    await this.backgroundNetworkService.updateStatuses()
    this.isUpdating = false
  }

  onOpened(opened: boolean) {
    if (opened) {
      const currentTimestamp = Date.now()
      const differenceInMilliseconds =
        currentTimestamp - this.lastUpdatedTimestamp
      const differenceInMinutes = differenceInMilliseconds / (1000 * 60)

      if (differenceInMinutes > REFRESH_PERIOD_MINUTES) {
        void this.updateNetworkStatuses()
      }

      void this.scheduleService.every(RefreshInterval.MEDIUM, {
        id: TASK_ID,
      })
    } else {
      void this.scheduleService.delete({
        id: TASK_ID,
      })
    }
  }
}
