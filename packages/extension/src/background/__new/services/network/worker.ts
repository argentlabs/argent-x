import { IScheduleService } from "../../../../shared/schedule/interface"
import { IBackgroundNetworkService } from "./interface"
import { RefreshInterval } from "../../../../shared/config"
import { everyWhenOpen } from "../worker/schedule/decorators"
import { IBackgroundUIService } from "../ui/interface"
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
    RefreshInterval.MEDIUM,
  )(async (): Promise<void> => {
    await this.backgroundNetworkService.updateStatuses()
  })
}
