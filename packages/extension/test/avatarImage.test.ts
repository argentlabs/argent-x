import { describe, expect, test } from "vitest"

import { getInitials } from "../src/shared/avatarImage"

describe("avatarImage", () => {
  describe("getInitials", () => {
    describe("when valid", () => {
      test("should return uppercase initials up to two characters ", () => {
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
        expect(getInitials("Account 10")).toEqual("A1")
        expect(getInitials("Account 9")).toEqual("A9")
        expect(getInitials("€ 9")).toEqual("€9")
        expect(getInitials("€ 9", true)).toEqual("9")
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
