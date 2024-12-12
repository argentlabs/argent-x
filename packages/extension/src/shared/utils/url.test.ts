import { describe, expect, test } from "vitest"

import { addQueryToUrl, getBaseUrlForHost, urlWithQuery } from "./url"

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
          "https://foo.bar.xyz/?foo=bar",
        )
        expect(
          urlWithQuery("https://foo.bar.xyz", { foo: "bar baz", bar: "foo" }),
        ).toEqual("https://foo.bar.xyz/?foo=bar+baz&bar=foo")
        expect(
          urlWithQuery(["https://foo.bar.xyz", "baz", "qux"], { foo: "bar" }),
        ).toEqual("https://foo.bar.xyz/baz/qux?foo=bar")
        expect(
          urlWithQuery(["/foo.bar.xyz", "baz", "qux"], {
            foo: "bar baz",
            bar: "foo",
          }),
        ).toEqual("/foo.bar.xyz/baz/qux?foo=bar+baz&bar=foo")
        expect(
          urlWithQuery("/account/activity?restoreScrollState=true", {
            restoreScrollState: "true",
          }),
        ).toEqual("/account/activity?restoreScrollState=true")
      })
    })
    describe("when invalid", () => {
      test("should throw an error", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(() => urlWithQuery({})).toThrow(TypeError)
      })
    })
  })

  describe("addQuery", () => {
    describe("when valid", () => {
      test("should return a url with query", () => {
        expect(addQueryToUrl("https://foo.bar.xyz", { foo: "bar" })).toEqual(
          "https://foo.bar.xyz/?foo=bar",
        )
        expect(
          addQueryToUrl("https://foo.bar.xyz?foo=bar+baz", { bar: "foo" }),
        ).toEqual("https://foo.bar.xyz/?foo=bar+baz&bar=foo")
        expect(
          addQueryToUrl("https://foo.bar.xyz?foo=bar+baz", { foo: "bar" }),
        ).toEqual("https://foo.bar.xyz/?foo=bar")
        expect(
          addQueryToUrl("/foo.bar.xyz/baz/qux?bar=baz", {
            foo: "bar baz",
            bar: "foo",
          }),
        ).toEqual("/foo.bar.xyz/baz/qux?bar=foo&foo=bar+baz")
        expect(
          addQueryToUrl("/account/activity?restoreScrollState=true", {
            restoreScrollState: "true",
          }),
        ).toEqual("/account/activity?restoreScrollState=true")
      })
    })
    describe("when invalid", () => {
      test("should throw an error", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(() => addQueryToUrl({})).toThrow(TypeError)
      })
    })
  })
})
