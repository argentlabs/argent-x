import type { DeepPick } from "../types/deepPick"
import { ALARM_VERSION } from "./constants"
import type {
  BaseScheduledTask,
  IScheduleService,
  ImplementedScheduledTask,
} from "./IScheduleService"

export type MinimalBrowser = DeepPick<
  typeof chrome,
  | "alarms.create"
  | "alarms.getAll"
  | "alarms.clear"
  | "alarms.onAlarm.addListener"
  | "runtime.onStartup.addListener"
  | "runtime.onInstalled.addListener"
>

type WaitFn = (ms: number) => Promise<void>
const wait: WaitFn = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getFrequency(id: string) {
  const match = id.match(/::run(\d+)$/)
  return match ? parseInt(match[1]) : 1
}

async function runWithTimer(fn: () => Promise<void>): Promise<number> {
  const start = Date.now()
  await fn()
  const duration = Date.now() - start
  return duration
}

async function runXTimesPerMinute(
  timesPerMinute: number,
  fn: () => Promise<void>,
  waitFn: WaitFn,
) {
  const intervalMs = Math.floor((60 / timesPerMinute) * 1000)
  let durationOffset = await runWithTimer(fn)
  for (let runs = 0; runs < timesPerMinute; runs++) {
    await waitFn(Math.max(intervalMs - durationOffset, 0))
    durationOffset = await runWithTimer(fn)
  }
}

export class ChromeScheduleService implements IScheduleService {
  private taskImplementationById: Record<string, ImplementedScheduledTask> = {}

  constructor(
    private readonly browser: MinimalBrowser,
    private readonly alarmVersion = ALARM_VERSION,
    private readonly waitFn: (ms: number) => Promise<void> = wait,
  ) {}

  isEqualAlarmId(a: string, b?: string) {
    return a === b || (b && a.startsWith(`${this.alarmVersion}::${b}::`))
  }

  async every(seconds: number, task: BaseScheduledTask): Promise<void> {
    const isSubMinute = seconds < 60
    const timesPerMinute = isSubMinute
      ? Math.max(Math.floor(60 / seconds), 1)
      : 1
    const periodInMinutes = Math.max(Math.round(seconds / 60), 1)
    await this.browser.alarms.create(
      `${this.alarmVersion}::${task.id}::run${timesPerMinute}`,
      {
        periodInMinutes,
      },
    )
    if (isSubMinute) {
      const taskImpl = this.taskImplementationById[task.id]
      void runXTimesPerMinute(timesPerMinute, taskImpl.callback, this.waitFn)
    }
  }

  async in(seconds: number, task: BaseScheduledTask): Promise<void> {
    const delayInMinutes = Math.max(Math.round(seconds / 60), 1)
    await this.browser.alarms.create(`${this.alarmVersion}::${task.id}::run1`, {
      delayInMinutes,
    })
  }

  async delete(task: BaseScheduledTask): Promise<void> {
    delete this.taskImplementationById[task.id]
    const allAlarms = await this.browser.alarms.getAll()
    const alarmsToDelete = allAlarms
      .filter((alarm) => this.isEqualAlarmId(alarm.name, task.id))
      .map((alarm) => alarm.name)

    await Promise.allSettled(
      alarmsToDelete.map((alarm) => this.browser.alarms.clear(alarm)),
    )
  }

  async registerImplementation(task: ImplementedScheduledTask): Promise<void> {
    this.taskImplementationById[task.id] = task
    this.browser.alarms.onAlarm.addListener((alarm) => {
      if (this.isEqualAlarmId(alarm.name, task.id)) {
        const frequency = getFrequency(alarm.name)
        void runXTimesPerMinute(frequency, task.callback, this.waitFn)
      }
    })
  }

  async onStartup(task: ImplementedScheduledTask): Promise<void> {
    this.browser.runtime.onStartup.addListener(() => {
      void task.callback()
    })
  }

  async onInstallAndUpgrade(task: ImplementedScheduledTask): Promise<void> {
    this.browser.runtime.onInstalled.addListener(() => {
      void task.callback()
    })
  }
}
