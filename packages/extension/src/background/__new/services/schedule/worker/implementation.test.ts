import { describe, expect, test, vi } from "vitest"

import { ScheduleWorker } from "./implementation"

describe("ScheduleWorker", () => {
  const makeWorker = () => {
    const alarmVersion = "v1.2.3"

    const browser = {
      alarms: {
        getAll: vi.fn(),
        clear: vi.fn(),
      },
    }
    const scheduleService = {
      registerImplementation: vi.fn(),
      in: vi.fn(),
      every: vi.fn(),
      delete: vi.fn(),
      onInstallAndUpgrade: vi.fn(),
      onStartup: vi.fn(),
    }
    const scheduleWorker = new ScheduleWorker(
      browser,
      scheduleService,
      alarmVersion,
    )
    return {
      scheduleWorker,
      browser,
      scheduleService,
      alarmVersion,
    }
  }
  test("prunes alarms with a different version", async () => {
    const otherVerson = "v0.0.1"
    const { scheduleWorker, browser, alarmVersion } = makeWorker()

    browser.alarms.getAll.mockResolvedValue([
      { name: `${otherVerson}::test::run1` },
      { name: `${otherVerson}::other::run1` },
      { name: `${alarmVersion}::test::run1` },
      { name: `${alarmVersion}::other::run1` },
    ])

    await scheduleWorker.pruneAlarms()

    expect(browser.alarms.clear).toHaveBeenCalledWith(
      `${otherVerson}::test::run1`,
    )
    expect(browser.alarms.clear).toHaveBeenCalledWith(
      `${otherVerson}::other::run1`,
    )

    expect(browser.alarms.clear).not.toHaveBeenCalledWith(
      `${alarmVersion}::test::run1`,
    )
    expect(browser.alarms.clear).not.toHaveBeenCalledWith(
      `${alarmVersion}::other::run1`,
    )
  })
})
