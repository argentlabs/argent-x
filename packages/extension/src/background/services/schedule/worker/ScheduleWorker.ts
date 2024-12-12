import { ALARM_VERSION } from "../../../../shared/schedule/constants"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { DeepPick } from "../../../../shared/types/deepPick"
import { IS_DEV } from "../../../../shared/utils/dev"
import { onInstallAndUpgrade } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"

export type MinimalBrowser = DeepPick<
  typeof chrome,
  "alarms.getAll" | "alarms.clear"
>

export class ScheduleWorker {
  constructor(
    private readonly browser: MinimalBrowser,
    private readonly scheduleService: IScheduleService,
    private readonly alarmVersion = ALARM_VERSION,
  ) {}

  runOnInstallAndUpgrade = pipe(onInstallAndUpgrade(this.scheduleService))(
    async (): Promise<void> => {
      await this.pruneAlarms()
    },
  )

  async pruneAlarms() {
    const allAlarms = await this.browser.alarms.getAll()
    const alarmsToDelete = allAlarms
      .filter((alarm) => !alarm.name.startsWith(`${this.alarmVersion}::`))
      .map((alarm) => alarm.name)

    if (!alarmsToDelete.length) {
      return
    }
    if (IS_DEV) {
      console.warn(
        "Deleting browser.alarms that do not have the current ALARM_VERSION_PREFIX:",
        alarmsToDelete.join(", "),
      )
    }

    await Promise.allSettled(
      alarmsToDelete.map((alarm) => this.browser.alarms.clear(alarm)),
    )
  }
}
