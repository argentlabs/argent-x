import { describe } from "vitest"
import { createScheduleServiceMock } from "../../../../../shared/schedule/mock"
import {
  onStartup,
  onInstallAndUpgrade,
  every,
  onOpen,
  onlyIfOpen,
  debounce,
  everyWhenOpen,
} from "./decorators"
import { getMockBackgroundUIService } from "./mockBackgroundUIService"
import { getMockDebounceService } from "../../../../../shared/debounce/mock"

describe("decorators", () => {
  describe("onStartup", () => {
    it("should call scheduleService.onStartup with the correct arguments", () => {
      const [, scheduleService] = createScheduleServiceMock()
      const fn = async () => {}
      onStartup(scheduleService)(fn)
      expect(scheduleService.onStartup).toHaveBeenCalledWith({
        id: "onStartup",
        callback: fn,
      })
    })
  })

  describe("onInstallAndUpgrade", () => {
    it("should call scheduleService.onInstallAndUpgrade with the correct arguments", () => {
      const [, scheduleService] = createScheduleServiceMock()
      const fn = async () => {}
      onInstallAndUpgrade(scheduleService)(fn)
      expect(scheduleService.onInstallAndUpgrade).toHaveBeenCalledWith({
        id: "onInstalled",
        callback: fn,
      })
    })
  })

  describe("every", () => {
    it("should call scheduleService.registerImplementation and scheduleService.every with the correct arguments", async () => {
      const [, scheduleService] = createScheduleServiceMock()
      const fn = async () => {}
      every(scheduleService, 1, "test")(fn)
      expect(scheduleService.registerImplementation).toHaveBeenCalledWith({
        id: expect.stringContaining("every@1s:"),
        callback: fn,
      })
      // flush the promise
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(scheduleService.every).toHaveBeenCalledWith(1, {
        id: expect.stringContaining("every@1s:"),
      })
    })
  })

  describe("onOpen", async () => {
    test("should call the function when the background ui service is opened", async () => {
      const [mockBackgroundUIServiceManager, mockBackgroundUIService] =
        getMockBackgroundUIService()
      const fn = vi.fn()
      onOpen(mockBackgroundUIService)(fn)
      expect(fn).toHaveBeenCalledTimes(0)
      await mockBackgroundUIServiceManager.setOpened(true)
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(false)
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(true)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("onlyIfOpen", async () => {
    test("should call the function when the background ui service is opened", async () => {
      const [mockBackgroundUIServiceManager, mockBackgroundUIService] =
        getMockBackgroundUIService()
      const fn = vi.fn()
      const oioFn = onlyIfOpen(mockBackgroundUIService)(fn)
      await oioFn()
      expect(fn).toHaveBeenCalledTimes(0)
      await mockBackgroundUIServiceManager.setOpened(true)
      await oioFn()
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(false)
      await oioFn()
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(true)
      await oioFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("debounce", () => {
    test("should call the function when not in debounce interval", async () => {
      const debounceService = getMockDebounceService()
      const fn = vi.fn()
      const debouncedFn = debounce(debounceService, 1, "test")(fn)
      expect(fn).toHaveBeenCalledTimes(0)
      expect(debounceService.debounce).toHaveBeenCalledTimes(0)
      await debouncedFn()
      expect(debounceService.debounce).toHaveBeenCalledWith({
        id: expect.stringContaining("debounce@1s:"),
        debounce: 1, // usually seconds, but mock implementation makes this ms
        callback: fn,
      })
    })
  })

  describe("everyWhenOpen", () => {
    test("should call the function when the background ui service is opened", async () => {
      const [mockBackgroundUIServiceManager, mockBackgroundUIService] =
        getMockBackgroundUIService()
      const [scheduleServiceManager, scheduleService] =
        createScheduleServiceMock()
      const debounceService = getMockDebounceService()
      const fn = vi.fn()
      const fnExec = everyWhenOpen(
        mockBackgroundUIService,
        scheduleService,
        debounceService,
        1,
        "test",
      )(fn)

      // wait 1 loop
      await new Promise((resolve) => setTimeout(resolve, 0))

      // test scheduleService
      expect(scheduleService.registerImplementation).toHaveBeenCalledWith({
        id: expect.stringContaining("every@1s:"),
        callback: expect.any(Function),
      })
      expect(scheduleService.every).toBeCalledTimes(1)

      // test onOpen
      expect(fn).toHaveBeenCalledTimes(0)
      await mockBackgroundUIServiceManager.setOpened(true)
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(false)
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(true)
      expect(fn).toHaveBeenCalledTimes(2)

      // test scheduleService
      await scheduleServiceManager.fireAll("every")
      expect(fn).toHaveBeenCalledTimes(3)

      // test debounce
      expect(debounceService.debounce).toHaveBeenCalledTimes(3)
      await fnExec()
      expect(debounceService.debounce).toHaveBeenCalledTimes(4)
      expect(debounceService.debounce).toHaveBeenCalledWith({
        id: expect.stringContaining("debounce@1s:"),
        debounce: 1,
        callback: expect.any(Function),
      })
      expect(fn).toHaveBeenCalledTimes(4)

      // does not call debounce when not open
      await mockBackgroundUIServiceManager.setOpened(false)
      await fnExec()
      expect(debounceService.debounce).toHaveBeenCalledTimes(4)
      expect(fn).toHaveBeenCalledTimes(4)
    })
  })
})
