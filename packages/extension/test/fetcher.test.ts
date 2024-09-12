import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { afterEach, describe, expect, test, vi } from "vitest"

import {
  Fetcher,
  FetcherError,
  fetcher,
  fetcherWithArgentApiHeadersForNetwork,
} from "../src/shared/api/fetcher"

const BASE_URL_ENDPOINT = "http://foo/v1/bar"
const INVALID_URL_ENDPOINT = "http://foo/v1/bar/invalid"
const INVALID_PAYLOAD_URL_ENDPOINT = "http://foo/v1/bar/invalid/payload"

const server = setupServer(
  http.get(BASE_URL_ENDPOINT, () => {
    return HttpResponse.json({ foo: "bar" })
  }),
  http.get(INVALID_URL_ENDPOINT, () => {
    return new HttpResponse(
      "<html><body>Non-json error response</body></html>",
      {
        status: 429,
      },
    )
  }),
  http.get(INVALID_PAYLOAD_URL_ENDPOINT, () => {
    return new HttpResponse("<html><body>Non-json error response</body></html>")
  }),
)

beforeAll(() => {
  server.listen()
})

afterAll(() => server.close())

afterEach(() => server.resetHandlers())
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
    describe("when valid", () => {
      test("returns parsed json", async () => {
        const response = await fetcher(BASE_URL_ENDPOINT)
        expect(response).toEqual({ foo: "bar" })
      })
    })
    describe("when invalid", () => {
      describe("and the server returns a status error", () => {
        test("returns a useful FetcherError object", async () => {
          const error = await captureFetcherError(fetcher(INVALID_URL_ENDPOINT))
          expect(error).toHaveProperty("url", INVALID_URL_ENDPOINT)
          expect(error).toHaveProperty("status", 429)
          expect(error).toHaveProperty("statusText", "Too Many Requests")
          expect(error).toHaveProperty(
            "responseText",
            "<html><body>Non-json error response</body></html>",
          )
        })
      })
      describe("and the server returns success but invalid playload", () => {
        test("returns a useful FetcherError object", async () => {
          const error = await captureFetcherError(
            fetcher(INVALID_PAYLOAD_URL_ENDPOINT),
          )
          expect(error).toHaveProperty("url", INVALID_PAYLOAD_URL_ENDPOINT)
          expect(error).toHaveProperty("status", 200)
          expect(error).toHaveProperty("statusText", "OK")
          expect(error).toHaveProperty(
            "responseText",
            "<html><body>Non-json error response</body></html>",
          )
        })
      })
    })
  })

  describe("fetcherWithArgentApiHeadersForNetwork()", () => {
    const ORIGINAL_PROCESS_ENV = process.env
    const MOCK_VERSION = "testing.1.2.3"
    const fetcher = vi.fn(async () => "foo") as Fetcher
    const fetcherWithArgentApiHeaders = fetcherWithArgentApiHeadersForNetwork(
      "sepolia-alpha",
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
            "argent-network": "sepolia",
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
            "argent-network": "sepolia",
          },
          method: "POST",
        })
      })
    })
  })
})
