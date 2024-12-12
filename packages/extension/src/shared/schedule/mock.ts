import type {
  IScheduleService,
  ImplementedScheduledTask,
} from "./IScheduleService"

interface ScheduleServiceManager {
  fireAll: (
    event: "every" | "in" | "onStartup" | "onInstallAndUpgrade",
  ) => Promise<number>
  fireTask: (taskId: string) => Promise<boolean>
  _addTaskImpl: (task: ImplementedScheduledTask) => void
  _addTaskEvent: (
    event: "every" | "in" | "onStartup" | "onInstallAndUpgrade",
    taskId: string,
  ) => void
  _deleteTask: (taskId: string) => void
}

export const createScheduleServiceMock = (): [
  ScheduleServiceManager,
  IScheduleService,
] => {
  const implementations: Set<ImplementedScheduledTask> = new Set()
  const tasksMap = {
    in: new Set<string>(),
    every: new Set<string>(),
    onStartup: new Set<string>(),
    onInstallAndUpgrade: new Set<string>(),
  }

  const manager: ScheduleServiceManager = {
    fireAll: async (
      event: "every" | "in" | "onStartup" | "onInstallAndUpgrade",
    ) => {
      const tasks = tasksMap[event]
      let success = 0
      for (const id of tasks) {
        const x = await manager.fireTask(id)
        if (x) {
          success++
        }
      }
      return success
    },
    fireTask: async (taskId: string) => {
      const task = [...implementations].find((t) => t.id === taskId)
      if (task) {
        await task.callback()
        return true
      }
      return false
    },
    _addTaskImpl: (task: ImplementedScheduledTask) => {
      implementations.add(task)
    },
    _addTaskEvent: (
      event: "every" | "in" | "onStartup" | "onInstallAndUpgrade",
      taskId: string,
    ) => {
      const tasks = tasksMap[event]
      tasks.add(taskId)
    },
    _deleteTask: (taskId: string) => {
      const task = [...implementations].find((t) => t.id === taskId)
      if (task) {
        implementations.delete(task)
      }
    },
  }

  const service: IScheduleService = {
    delete: vi.fn((task) => Promise.resolve(manager._deleteTask(task.id))),
    in: vi.fn((_, task) =>
      Promise.resolve(manager._addTaskEvent("in", task.id)),
    ),
    every: vi.fn((_, task) =>
      Promise.resolve(manager._addTaskEvent("every", task.id)),
    ),
    onInstallAndUpgrade: vi.fn(() =>
      Promise.resolve(
        manager._addTaskEvent("onInstallAndUpgrade", "onInstalled"),
      ),
    ),
    onStartup: vi.fn(() =>
      Promise.resolve(manager._addTaskEvent("onStartup", "onStartup")),
    ),
    registerImplementation: vi.fn((task) =>
      Promise.resolve(manager._addTaskImpl(task)),
    ),
  }
  return [manager, service]
}
