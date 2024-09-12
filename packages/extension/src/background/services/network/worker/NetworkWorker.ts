import { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import { IBackgroundNetworkService } from "../IBackgroundNetworkService"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import { everyWhenOpen } from "../../worker/schedule/decorators"
import { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { IDebounceService } from "../../../../shared/debounce"

const TASK_ID = "NetworkWorker.updateStatuses"

export class NetworkWorker {
  constructor(
    private readonly backgroundNetworkService: IBackgroundNetworkService,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly scheduleService: IScheduleService<typeof TASK_ID>,
    private readonly debounceService: IDebounceService<typeof TASK_ID>,
  ) {}

  updateNetworkStatuses = everyWhenOpen(
    this.backgroundUIService,
    this.scheduleService,
    this.debounceService,
    RefreshIntervalInSeconds.MEDIUM,
    "NetworkWorker.updateNetworkStatuses",
  )(async (): Promise<void> => {
    await this.backgroundNetworkService.updateStatuses()
  })
}
