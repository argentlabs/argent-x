import { BaseScheduledTask } from "../schedule/interface"
import { KeyValueStorage } from "../storage"
import {
  DebouncedImplementedScheduledTask,
  IDebounceService,
} from "./interface"

function shouldRun(lastRun: number, debounce: number): boolean {
  return Date.now() - lastRun > debounce
}

export class DebounceService<T extends string = string>
  implements IDebounceService<T>
{
  // it's okay to keep this inmemory, as worker should ignore if shut down during task
  private readonly taskIsRunning = new Map<string, boolean>()

  constructor(
    private readonly kv: KeyValueStorage<{
      [key: string]: number
    }>,
  ) {}

  async debounce(task: DebouncedImplementedScheduledTask<T>): Promise<void> {
    const lastRun = await this.lastRun(task)
    if (this.isRunning(task) || !shouldRun(lastRun ?? 0, task.debounce)) {
      // if task is running or last run is within debounce,
      return
    }

    this.taskIsRunning.set(task.id, true)
    await this.kv.set(task.id, Date.now())
    this.taskIsRunning.set(task.id, false)
  }

  isRunning(task: BaseScheduledTask): boolean {
    return this.taskIsRunning.get(task.id) ?? false
  }

  async lastRun(task: BaseScheduledTask): Promise<number | undefined> {
    const taskRun = await this.kv.get(task.id)
    if (!taskRun) {
      return
    }
    return taskRun
  }
}
