import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { ISettingsStorage } from "../../../../shared/settings/types"
import type { KeyValueStorage } from "../../../../shared/storage"
import type { IBackgroundUIService } from "../../../services/ui/IBackgroundUIService"
import { onClose, onOpen } from "../../../services/worker/schedule/decorators"
import { pipe } from "../../../services/worker/schedule/pipe"
import type { WalletSessionService } from "../WalletSessionService"

const autoLockTaskId = "WalletSessionWorker::autoLock"

export class WalletSessionWorker {
  constructor(
    private readonly walletSessionService: WalletSessionService,
    private readonly scheduleService: IScheduleService<typeof autoLockTaskId>,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {
    void this.scheduleService.registerImplementation({
      id: autoLockTaskId,
      callback: this.lock.bind(this),
    })
  }

  async lock() {
    void this.walletSessionService.lock()
  }

  onClose = pipe(onClose(this.backgroundUIService))(async () => {
    const autoLockTimeMinutes = await this.settingsStore.get(
      "autoLockTimeMinutes",
    )
    if (autoLockTimeMinutes === 0) {
      return this.lock()
    }
    const autoLockTimeSeconds = autoLockTimeMinutes * 60
    void this.scheduleService.in(autoLockTimeSeconds, {
      id: autoLockTaskId,
    })
  })

  onOpen = pipe(onOpen(this.backgroundUIService))(async () => {
    void this.scheduleService.delete({
      id: autoLockTaskId,
    })
  })
}
