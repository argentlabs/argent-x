import "vi-fetch/setup"

import { mockFetch, mockGet } from "vi-fetch"
import { describe, expect, test, vi } from "vitest"

import {
  FetcherError,
  fetcher,
  fetcherWithArgentApiHeadersForNetwork,
} from "../src/shared/api/fetcher"

/** capture and return expected errors, otherwise vi-fetch test will fail even with expect...toThrow... etc. */
const captureFetcherError = async (invocation: Promise<any | FetcherError>) => {
  try {
    const response = await invocation
    return response
  } catch (error) {
    return error as FetcherError
  }
}

describe("fetcher", () => {
  describe("fetcher", () => {
    beforeEach(() => {
      mockFetch.clearAll()
    })
    describe("when valid", () => {
      test("returns parsed json", async () => {
        const mock =
          mockGet("http://foo/v1/bar").willResolve('{ "foo": "bar" }')
        const response = await fetcher("http://foo/v1/bar")
        expect(response).toEqual({ foo: "bar" })
        expect(mock).toHaveFetched()
      })
    })
    describe("when invalid", () => {
      describe("and the server returns a status error", () => {
        test("returns a useful FetcherError object", async () => {
          const mock = mockGet("http://foo/v1/bar").willFail(
            "<html><body>Non-json error response</body></html>",
            429,
          )
          const error = await captureFetcherError(fetcher("http://foo/v1/bar"))
          expect(error).toHaveProperty("url", "http://foo/v1/bar")
          expect(error).toHaveProperty("status", 429)
          expect(error).toHaveProperty("statusText", "Too Many Requests")
          expect(error).toHaveProperty(
            "responseText",
            "<html><body>Non-json error response</body></html>",
          )
          expect(mock).toHaveFetched()
        })
      })
      describe("and the server returns success but invalid playload", () => {
        test("returns a useful FetcherError object", async () => {
          const mock = mockGet("http://foo/v1/bar").willResolve(
            "<html><body>Non-json error response</body></html>",
          )
          const error = await captureFetcherError(fetcher("http://foo/v1/bar"))
          expect(error).toHaveProperty("url", "http://foo/v1/bar")
          expect(error).toHaveProperty("status", 200)
          expect(error).toHaveProperty("statusText", "OK")
          expect(error).toHaveProperty(
            "responseText",
            "<html><body>Non-json error response</body></html>",
          )
          expect(mock).toHaveFetched()
        })
      })
    })
  })

  describe("fetcherWithArgentApiHeadersForNetwork()", () => {
    const ORIGINAL_PROCESS_ENV = process.env
    const MOCK_VERSION = "testing.1.2.3"
    const fetcher = vi.fn(async () => "foo")
    const fetcherWithArgentApiHeaders = fetcherWithArgentApiHeadersForNetwork(
      "goerli-alpha",
      fetcher,
    )

    beforeAll(() => {
      process.env = {
        VERSION: MOCK_VERSION,
      }
    })

    afterAll(() => {
      process.env = ORIGINAL_PROCESS_ENV
    })

    describe("when no options set", () => {
      test("should provide the expected API headers to underlying fetcher", async () => {
        expect(fetcherWithArgentApiHeaders("/foo/bar")).resolves.toEqual("foo")
        expect(fetcher).toHaveBeenLastCalledWith("/foo/bar", {
          headers: {
            "argent-version": MOCK_VERSION,
            "argent-client": "argent-x",
            "argent-network": "goerli",
          },
        })
      })
    })
    describe("when options set", () => {
      test("should provide the expected API headers to underlying fetcher", async () => {
        expect(
          fetcherWithArgentApiHeaders("/foo/bar", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: "foo",
          }),
        ).resolves.toEqual("foo")
        expect(fetcher).toHaveBeenLastCalledWith("/foo/bar", {
          body: "foo",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "argent-version": MOCK_VERSION,
            "argent-client": "argent-x",
            "argent-network": "goerli",
          },
          method: "POST",
        })
      })
    })
  })
})
