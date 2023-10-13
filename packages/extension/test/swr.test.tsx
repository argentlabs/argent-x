import { fireEvent, render, screen } from "@testing-library/react"
import { useCallback, useState } from "react"
import useSWR, { SWRConfig } from "swr"
import { describe, expect, test, vi } from "vitest"

import { delay } from "../src/shared/utils/delay"
import {
  useConditionallyEnabledSWR,
  withPolling,
} from "../src/ui/services/swr.service"

describe("swr", () => {
  describe("useConditionallyEnabledSWR()", () => {
    test("should use the fetcher and return data when enabled, set data to undefined when disabled", async () => {
      const fetcher = vi.fn((value: string) => value)
      const cache = new Map()

      function Component() {
        const [value, setValue] = useState("foo")
        const [enabled, setEnabled] = useState(true)
        const valueFetcher = useCallback(() => fetcher(value), [value])
        const { data } = useConditionallyEnabledSWR<string>(
          enabled,
          "test-key",
          valueFetcher,
        )
        return (
          <div>
            <p>value:{value}</p>
            <p>data:{data === undefined ? "undefined" : data}</p>
            <button
              onClick={() => {
                setEnabled((x) => !x)
              }}
            >
              toggle
            </button>
            <button
              onClick={() => {
                setValue("bar")
              }}
            >
              update
            </button>
          </div>
        )
      }

      render(
        <SWRConfig value={{ provider: () => cache }}>
          <Component />
        </SWRConfig>,
      )
      await screen.findByText("data:foo")
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(cache.get("test-key")).toEqual("foo")

      // Change to disabled
      fireEvent.click(screen.getByText("toggle"))

      // Should reset the data and not call fetcher() again
      await screen.findByText("data:undefined")
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Cache should be deleted
      expect(cache.get("test-key")).toBeUndefined()

      // Change to enabled
      fireEvent.click(screen.getByText("toggle"))

      // Should fetch the data and call fetcher() again
      await screen.findByText("data:foo")
      expect(fetcher).toHaveBeenCalledTimes(2)

      // Cache should be populated
      expect(cache.get("test-key")).toEqual("foo")

      // Update the returned value
      fireEvent.click(screen.getByText("update"))
      await screen.findByText("value:bar")

      // Change to disabled
      fireEvent.click(screen.getByText("toggle"))

      // Should reset the data and not call fetcher() again
      await screen.findByText("data:undefined")
      expect(fetcher).toHaveBeenCalledTimes(2)

      // Cache should be deleted
      expect(cache.get("test-key")).toBeUndefined()

      // Change to enabled
      fireEvent.click(screen.getByText("toggle"))

      // Should fetch the updated data and call fetcher() again
      await screen.findByText("data:bar")
      expect(fetcher).toHaveBeenCalledTimes(3)

      // Cache should be populated
      expect(cache.get("test-key")).toEqual("bar")
    })
  })

  describe("withPolling()", () => {
    test("should initially fetch, then only poll at specified interval", async () => {
      const POLL_INTERVAL = 100
      const fetcher = vi.fn(() => "foo")

      function Component() {
        const { data } = useSWR<string>(
          "test-key",
          fetcher,
          withPolling(POLL_INTERVAL),
        )
        return (
          <div>
            <p>data:{data === undefined ? "undefined" : data}</p>
          </div>
        )
      }

      render(
        <>
          <Component />
          <Component />
          <Component />
          <Component />
          <Component />
          <Component />
          <Component />
          <Component />
          <Component />
          <Component />
        </>,
      )
      await screen.findAllByText("data:foo")

      // initial fetch
      expect(fetcher).toHaveBeenCalledTimes(1)

      // offset before checking polling
      await delay(0.5 * POLL_INTERVAL)

      await delay(POLL_INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(1)

      await delay(POLL_INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(2)

      await delay(POLL_INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(3)

      await delay(POLL_INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(4)

      await delay(POLL_INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(5)
    })
  })
})
