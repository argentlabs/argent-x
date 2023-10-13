import { beforeEach, describe, test, vi } from "vitest"

import { ChromeScheduleService } from "./chromeService"
import { BaseScheduledTask, ImplementedScheduledTask } from "./interface"

describe("ChromeScheduleService", () => {
  let waitFn = vi.fn()
  let service: ChromeScheduleService
  let mockBrowser = {
    alarms: {
      create: vi.fn(),
      getAll: vi.fn(),
      clear: vi.fn(),
      onAlarm: {
        addListener: vi.fn(),
      },
    },
  }

  beforeEach(() => {
    waitFn = vi.fn()
    mockBrowser = {
      alarms: {
        create: vi.fn(),
        getAll: vi.fn(),
        clear: vi.fn(),
        onAlarm: {
          addListener: vi.fn(),
        },
      },
    }
    service = new ChromeScheduleService(mockBrowser, waitFn)
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
      { name: "test::run1" },
      { name: "other::run1" },
    ])
    await service.delete(task)
    expect(mockBrowser.alarms.clear).toBeCalledWith("test::run1")
  })

  test("registerImplementation adds alarm listener", async () => {
    const task: ImplementedScheduledTask = {
      id: "test",
      callback: vi.fn(),
    }
    await service.registerImplementation(task)
    expect(mockBrowser.alarms.onAlarm.addListener).toBeCalled()
    const callback = mockBrowser.alarms.onAlarm.addListener.mock.calls[0][0]
    callback({ name: "test::run1" })
    expect(task.callback).toBeCalled()
  })

  test("registerImplementation runs callback once per minute", async () => {
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
    mockBrowser.alarms.create.mockImplementationOnce((name, options) => {
      expect(name).toBe("test::run1")
      expect(options).toEqual({ periodInMinutes: 1 })
      cb?.({ name })
    })
    await service.every(60, task)
    expect(mockBrowser.alarms.create).toBeCalled()
    expect(waitFn).toBeCalledTimes(0)
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
    mockBrowser.alarms.create.mockImplementationOnce((name, options) => {
      expect(name).toBe("test::run5")
      expect(options).toEqual({ periodInMinutes: 1 })
      cb?.({ name })
    })
    await service.every(10, task)
    expect(mockBrowser.alarms.create).toBeCalledTimes(1)

    // wait for next tick
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(waitFn).toBeCalledTimes(4)
    expect(task.callback).toBeCalledTimes(5)
  })
})
