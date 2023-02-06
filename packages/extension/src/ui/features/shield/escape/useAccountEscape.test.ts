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
      expect(getActiveFromNow(getDaysFromNow(7).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 604800000,
          "activeFromNowPretty": "7 days",
        }
      `)
      expect(getActiveFromNow(getDaysFromNow(1).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 86400000,
          "activeFromNowPretty": "1 day",
        }
      `)
      expect(getActiveFromNow(getHoursFromNow(23).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 82800000,
          "activeFromNowPretty": "23 hours",
        }
      `)
      expect(getActiveFromNow(getHoursFromNow(1).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 3600000,
          "activeFromNowPretty": "1 hour",
        }
      `)
      expect(getActiveFromNow(getMinutesFromNow(59).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 3540000,
          "activeFromNowPretty": "59 minutes",
        }
      `)
      expect(getActiveFromNow(getMinutesFromNow(1).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 60000,
          "activeFromNowPretty": "1 minute",
        }
      `)
      expect(getActiveFromNow(getMinutesFromNow(0).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 0,
          "activeFromNowPretty": "now",
        }
      `)
      expect(getActiveFromNow(getMinutesFromNow(-1).getTime() / 1000))
        .toMatchInlineSnapshot(`
        {
          "activeFromNowMs": 0,
          "activeFromNowPretty": "now",
        }
      `)
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
