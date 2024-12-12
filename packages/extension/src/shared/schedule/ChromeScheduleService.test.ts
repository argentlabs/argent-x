import { beforeEach, describe, test, vi } from "vitest"

import { ChromeScheduleService } from "./ChromeScheduleService"
import type {
  BaseScheduledTask,
  ImplementedScheduledTask,
} from "./IScheduleService"

function getMockBrowser() {
  const onStartUpListeners: Array<(...args: unknown[]) => void> = []
  const onInstalledListeners: Array<(...args: unknown[]) => void> = []
  return {
    alarms: {
      create: vi.fn(),
      getAll: vi.fn(),
      clear: vi.fn(),
      onAlarm: {
        addListener: vi.fn(),
      },
    },
    runtime: {
      onStartup: {
        addListener: vi.fn((callback: () => void) =>
          onStartUpListeners.push(callback),
        ),
      },
      onInstalled: {
        addListener: vi.fn((callback: (details: any) => void) =>
          onInstalledListeners.push(callback),
        ),
      },
    },
    _methods: {
      fireOnStartup: () => onStartUpListeners.forEach((cb) => cb()),
      fireOnInstalled: () => onInstalledListeners.forEach((cb) => cb()),
    },
  }
}

describe("ChromeScheduleService", () => {
  const alarmVersion = "v1.2.3"
  let waitFn = vi.fn()
  let service: ChromeScheduleService
  let mockBrowser = getMockBrowser()

  beforeEach(() => {
    waitFn = vi.fn()
    mockBrowser = getMockBrowser()
    service = new ChromeScheduleService(mockBrowser, alarmVersion, waitFn)
  })

  test("every creates an alarm", async () => {
    const task: BaseScheduledTask = {
      id: "test",
    }
    await service.every(60, task)
    expect(mockBrowser.alarms.create).toBeCalled()
  })

  test("delete clears alarms associated with a task", async () => {
    const task: BaseScheduledTask = {
      id: "test",
    }
    mockBrowser.alarms.getAll.mockResolvedValue([
      { name: `${alarmVersion}::test::run1` },
      { name: `${alarmVersion}::other::run1` },
    ])
    await service.delete(task)
    expect(mockBrowser.alarms.clear).toBeCalledWith(
      `${alarmVersion}::test::run1`,
    )
    expect(mockBrowser.alarms.clear).not.toBeCalledWith(
      `${alarmVersion}::other::run1`,
    )
  })

  test("registerImplementation adds alarm listener", async () => {
    const task: ImplementedScheduledTask = {
      id: "test",
      callback: vi.fn(),
    }
    await service.registerImplementation(task)
    expect(mockBrowser.alarms.onAlarm.addListener).toBeCalled()
    const callback = mockBrowser.alarms.onAlarm.addListener.mock.calls[0][0]
    callback({ name: `${alarmVersion}::test::run1` })
    expect(task.callback).toBeCalled()
  })

  test("registerImplementation runs callback once per minute", async () => {
    let cb: ((alarm: { name: string }) => void) | undefined = undefined
    const task: ImplementedScheduledTask = {
      id: `test`,
      callback: vi.fn(),
    }
    mockBrowser.alarms.onAlarm.addListener.mockImplementationOnce(
      (callback) => {
        cb = callback
      },
    )
    await service.registerImplementation(task)
    expect(mockBrowser.alarms.onAlarm.addListener).toBeCalled()
    expect(cb).toBeDefined()
    mockBrowser.alarms.create.mockImplementationOnce((name, options) => {
      expect(name).toBe(`${alarmVersion}::test::run1`)
      expect(options).toEqual({ periodInMinutes: 1 })
      cb?.({ name })
    })
    await service.every(60, task)
    expect(mockBrowser.alarms.create).toBeCalled()
    expect(waitFn).toBeCalledTimes(1)
    expect(task.callback).toBeCalledTimes(1)
  })

  test("registerImplementation runs callback multiple times per minute", async () => {
    let cb: ((alarm: { name: string }) => void) | undefined = undefined
    const task: ImplementedScheduledTask = {
      id: "test",
      callback: vi.fn(),
    }
    mockBrowser.alarms.onAlarm.addListener.mockImplementationOnce(
      (callback) => {
        cb = callback
      },
    )
    await service.registerImplementation(task)
    expect(mockBrowser.alarms.onAlarm.addListener).toBeCalled()
    expect(cb).toBeDefined()

    const mockBrowserAlarmFired = vi.fn()
    mockBrowser.alarms.create.mockImplementationOnce((name, options) => {
      expect(name).toBe(`${alarmVersion}::test::run6`)
      expect(options).toEqual({ periodInMinutes: 1 })
      // simulate the 1-minute delay in browser alarms
      setTimeout(() => {
        mockBrowserAlarmFired()
        cb?.({ name })
      }, 2)
    })
    await service.every(10, task)
    expect(mockBrowser.alarms.create).toBeCalledTimes(1)

    // wait for next tick
    await new Promise((resolve) => setTimeout(resolve, 0))

    // sub-minute runs before alarm fires
    expect(mockBrowserAlarmFired).toBeCalledTimes(0)
    expect(waitFn).toBeCalledTimes(6)
    expect(task.callback).toBeCalledTimes(7)

    // wait for next tick
    await new Promise((resolve) => setTimeout(resolve, 0))

    // alarm-based runs after 1 minute
    expect(mockBrowserAlarmFired).toBeCalledTimes(1)
    expect(waitFn).toBeCalledTimes(12)
    expect(task.callback).toBeCalledTimes(14)
  })

  // add tests for service.onStartup and service.onInstallAndUpgrade
  test("onStartup runs callback", async () => {
    const task: ImplementedScheduledTask = {
      id: "test",
      callback: vi.fn(),
    }
    await service.onStartup(task)
    expect(mockBrowser.runtime.onStartup.addListener).toBeCalled()
    mockBrowser._methods.fireOnStartup()
    expect(task.callback).toBeCalled()
  })

  test("onInstallAndUpgrade runs callback", async () => {
    const task: ImplementedScheduledTask = {
      id: "test",
      callback: vi.fn(),
    }
    await service.onInstallAndUpgrade(task)
    expect(mockBrowser.runtime.onInstalled.addListener).toBeCalled()
    mockBrowser._methods.fireOnInstalled()
    expect(task.callback).toBeCalled()
  })
})
