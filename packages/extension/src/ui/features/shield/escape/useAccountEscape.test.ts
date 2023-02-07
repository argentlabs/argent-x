import { describe, expect, test } from "vitest"

import { getActiveFromNow } from "./useAccountEscape"

const getDaysFromNow = (days = 0) => {
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + days)
  return future
}

const getHoursFromNow = (hours = 0) => {
  const now = new Date()
  const future = new Date()
  future.setHours(now.getHours() + hours)
  return future
}

const getMinutesFromNow = (minutes = 0) => {
  const now = new Date()
  const future = new Date()
  future.setMinutes(now.getMinutes() + minutes)
  return future
}

describe("getActiveFromNow", () => {
  describe("when valid", () => {
    test("should return the expected active state", () => {
      expect(
        getActiveFromNow(getDaysFromNow(7).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "7 days")
      expect(
        getActiveFromNow(getHoursFromNow(24 * 6.5).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "7 days")
      expect(
        getActiveFromNow(getDaysFromNow(6).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "6 days")
      expect(
        getActiveFromNow(getDaysFromNow(1).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "1 day")
      expect(
        getActiveFromNow(getMinutesFromNow(60 * 23.5).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "23 hours")
      expect(
        getActiveFromNow(getHoursFromNow(23).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "23 hours")
      expect(
        getActiveFromNow(getHoursFromNow(1).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "1 hour")
      expect(
        getActiveFromNow(getMinutesFromNow(59).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "59 minutes")
      expect(
        getActiveFromNow(getMinutesFromNow(30).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "30 minutes")
      expect(
        getActiveFromNow(getMinutesFromNow(1).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "1 minute")
      expect(
        getActiveFromNow(getMinutesFromNow(0).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "now")
      expect(
        getActiveFromNow(getMinutesFromNow(-1).getTime() / 1000),
      ).toHaveProperty("activeFromNowPretty", "now")
    })
  })
  describe("when invalid", () => {
    test("should return undefined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => getActiveFromNow({})).toThrowErrorMatchingInlineSnapshot(
        '"activeAt should be numeric"',
      )
    })
  })
})
