import { describe, expect, test } from "vitest"

import { getBaseUrlForHost, urlWithQuery } from "../src/shared/utils/url"

describe("url", () => {
  describe("getBaseUrlForHost", () => {
    describe("when valid", () => {
      test("should return the base url", () => {
        expect(getBaseUrlForHost("foo.bar.xyz")).toEqual("https://foo.bar.xyz")
        expect(getBaseUrlForHost("foo.bar.xyz/foo/bar/")).toEqual(
          "https://foo.bar.xyz",
        )
      })
    })
    describe("when invalid", () => {
      test("should throw an error", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(() => getBaseUrlForHost({})).toThrowErrorMatchingInlineSnapshot(
          '"Unable to make a base url from host"',
        )
      })
    })
  })

  describe("urlWithQuery", () => {
    describe("when valid", () => {
      test("should return a url with query", () => {
        expect(urlWithQuery("https://foo.bar.xyz", { foo: "bar" })).toEqual(
          "https://foo.bar.xyz?foo=bar",
        )
        expect(
          urlWithQuery("https://foo.bar.xyz", { foo: "bar baz", bar: "foo" }),
        ).toEqual("https://foo.bar.xyz?foo=bar+baz&bar=foo")
        expect(
          urlWithQuery(["https://foo.bar.xyz", "baz", "qux"], { foo: "bar" }),
        ).toEqual("https://foo.bar.xyz/baz/qux?foo=bar")
        expect(
          urlWithQuery(["https://foo.bar.xyz", "baz", "qux"], {
            foo: "bar baz",
            bar: "foo",
          }),
        ).toEqual("https://foo.bar.xyz/baz/qux?foo=bar+baz&bar=foo")
      })
    })
    describe("when invalid", () => {
      test("should throw an error", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(() => urlWithQuery({})).toThrowErrorMatchingInlineSnapshot(
          "[TypeError: Url must be a string. Received undefined]",
        )
      })
    })
  })
})
