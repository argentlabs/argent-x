import { describe, expect, test, vi } from "vitest"

import { useAppState } from "../src/ui/app.state"
import { argentApiFetcher } from "../src/ui/services/argentApiFetcher"

describe("fetcher", () => {
  describe("argentApiFetcher()", () => {
    const ORIGINAL_PROCESS_ENV = process.env
    const MOCK_VERSION = "testing.1.2.3"
    const fetcher = vi.fn(async () => "foo")

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
        useAppState.setState({ switcherNetworkId: "goerli-alpha" })
        expect(argentApiFetcher("/foo/bar", {}, fetcher)).resolves.toEqual(
          "foo",
        )
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
        useAppState.setState({ switcherNetworkId: "goerli-alpha" })
        expect(
          argentApiFetcher(
            "/foo/bar",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: "foo",
            },
            fetcher,
          ),
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
