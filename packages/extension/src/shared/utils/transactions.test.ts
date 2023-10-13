import { describe, expect, test } from "vitest"
import { getEntryPointSafe } from "./transactions"

describe("transactions", () => {
  describe("getEntryPointSafe", () => {
    describe(`when entrypoint is camelCase and cairo version 1"`, () => {
      test("should return true", () => {
        expect(getEntryPointSafe("testEntrypoint", "1")).toEqual(
          "test_entrypoint",
        )
      })
    })
    describe(`when entrypoint is camelCase and cairo version 0"`, () => {
      test("should return false", () => {
        expect(getEntryPointSafe("testEntrypoint", "0")).toEqual(
          "testEntrypoint",
        )
      })
    })
    describe(`when entrypoint is snake_case and cairo version 1"`, () => {
      test("should return false", () => {
        expect(getEntryPointSafe("test_entrypoint", "1")).toEqual(
          "test_entrypoint",
        )
      })
    })
    describe(`when entrypoint is snake_case and cairo version 0"`, () => {
      test("should return false", () => {
        expect(getEntryPointSafe("test_entrypoint", "0")).toEqual(
          "testEntrypoint",
        )
      })
    })
    describe(`when entrypoint is random and cairo version 1"`, () => {
      test("should return false", () => {
        expect(getEntryPointSafe("test entrypoint", "1")).toEqual(
          "test_entrypoint",
        )
      })
    })
    describe(`when entrypoint is randomCaSe and cairo version 0"`, () => {
      test("should return false", () => {
        expect(getEntryPointSafe("test entrypoint", "0")).toEqual(
          "testEntrypoint",
        )
      })
    })
  })
})
