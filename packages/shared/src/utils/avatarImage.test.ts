import { describe, expect, test } from "vitest"

import { getInitials } from "./initials"

describe("avatarImage", () => {
  describe("getInitials", () => {
    describe("when valid", () => {
      test("should return uppercase initials up to two characters", () => {
        expect(getInitials("f")).toEqual("F")
        expect(getInitials("foo")).toEqual("FO")
        expect(getInitials("  foo  ")).toEqual("FO")
        expect(getInitials("foo bar")).toEqual("FB")
        expect(getInitials("  foo   bar  ////")).toEqual("FB")
        expect(getInitials("foo1")).toEqual("F1")
        expect(getInitials(" foo   bar  __   qux")).toEqual("FQ")
        expect(getInitials("___foo   bar        qux    zod")).toEqual("FZ")
        expect(getInitials("FooBar")).toEqual("FB")
        expect(getInitials("FooBarQuxZod")).toEqual("FZ")
        expect(getInitials("Account 1")).toEqual("A1")
        expect(getInitials("Account 9")).toEqual("A9")
        expect(getInitials("€ 9")).toEqual("€9")
        expect(getInitials("€ 9", true)).toEqual("9")
      })
      test("when ending with a whole number, include the number up to 2 characters", () => {
        expect(getInitials("1")).toEqual("1")
        expect(getInitials("10")).toEqual("10")
        expect(getInitials("100")).toEqual("10")
        expect(getInitials("ABC1")).toEqual("A1")
        expect(getInitials("ABC10")).toEqual("A10")
        expect(getInitials("ABC100")).toEqual("A10")
        expect(getInitials("1ABC1")).toEqual("11")
        expect(getInitials("1ABC10")).toEqual("110")
        expect(getInitials("1ABC100")).toEqual("110")
        expect(getInitials("Account 1")).toEqual("A1")
        expect(getInitials("Account 10")).toEqual("A10")
        expect(getInitials("Account 100")).toEqual("A10")
      })
    })
    describe("when invalid", () => {
      test("should return an empty string", () => {
        expect(getInitials("")).toEqual("")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getInitials({})).toEqual("")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getInitials()).toEqual("")
      })
    })
  })
})
