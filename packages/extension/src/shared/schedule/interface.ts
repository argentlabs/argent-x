export interface BaseScheduledTask<T extends string = string> {
  id: T
}

export interface ImplementedScheduledTask<T extends string = string>
  extends BaseScheduledTask<T> {
  callback: () => Promise<void>
}

export interface IScheduleService<T extends string = string> {
  // // not used, so lets not implement them for now
  in(seconds: number, task: BaseScheduledTask): Promise<void>
  // at(date: Date, task: BaseScheduledTask): Promise<void>
  every(seconds: number, task: BaseScheduledTask<T>): Promise<void>

  delete(task: BaseScheduledTask<T>): Promise<void>

  registerImplementation(task: ImplementedScheduledTask<T>): Promise<void>
}
