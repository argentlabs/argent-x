import { describe, expect, test, vi } from "vitest"

import { fetcherWithArgentApiHeadersForNetwork } from "../src/shared/api/fetcher"

describe("fetcher", () => {
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
