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
      const scheduleService = createScheduleServiceMock()
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
      const scheduleService = createScheduleServiceMock()
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
      const scheduleService = createScheduleServiceMock()
      const fn = async () => {}
      every(scheduleService, 1)(fn)
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

  describe("onOpen", async () => {
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
      const debouncedFn = debounce(debounceService, 1)(fn)
      expect(fn).toHaveBeenCalledTimes(0)
      expect(debounceService.debounce).toHaveBeenCalledTimes(0)
      await debouncedFn()
      expect(debounceService.debounce).toHaveBeenCalledWith({
        id: expect.stringContaining("debounce@1s:"),
        debounce: 1,
        callback: fn,
      })
    })
  })

  describe("everyWhenOpen", () => {
    test("should call the function when the background ui service is opened", async () => {
      const [mockBackgroundUIServiceManager, mockBackgroundUIService] =
        getMockBackgroundUIService()
      const scheduleService = createScheduleServiceMock()
      const debounceService = getMockDebounceService()
      const fn = vi.fn()
      everyWhenOpen(
        mockBackgroundUIService,
        scheduleService,
        debounceService,
        1,
      )(fn)
      expect(fn).toHaveBeenCalledTimes(0)
      await mockBackgroundUIServiceManager.setOpened(true)
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(false)
      expect(fn).toHaveBeenCalledTimes(1)
      await mockBackgroundUIServiceManager.setOpened(true)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})
