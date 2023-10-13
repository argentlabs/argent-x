import { describe, expect, test } from "vitest"
import { isFeatureEnabled } from "./env"

describe("env", () => {
  describe("isFeatureEnabled", () => {
    describe(`when feature flag is "true"`, () => {
      test("should return true", () => {
        expect(isFeatureEnabled("true")).toEqual(true)
      })
    })
    describe(`when feature flag is "false"`, () => {
      test("should return false", () => {
        expect(isFeatureEnabled("false")).toEqual(false)
      })
    })
    describe(`when feature flag is different than "true"`, () => {
      test("should return false", () => {
        expect(isFeatureEnabled("not_true")).toEqual(false)
      })
    })
    describe(`when feature flag is undefined"`, () => {
      test("should return false", () => {
        expect(isFeatureEnabled(undefined)).toEqual(false)
      })
    })
  })
})
