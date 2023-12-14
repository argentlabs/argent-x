import {
  ImplementedScheduledTask,
  BaseScheduledTask,
} from "../schedule/interface"

export interface DebouncedImplementedScheduledTask<T extends string = string>
  extends ImplementedScheduledTask<T> {
  debounce: number // in seconds
}

export interface IDebounceService<T extends string = string> {
  debounce(task: DebouncedImplementedScheduledTask<T>): Promise<void>
  isRunning(task: BaseScheduledTask): boolean
  lastRun(task: BaseScheduledTask): Promise<number | undefined>
}
