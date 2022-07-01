import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"

import { useConditionallyEnabledSWR } from "../src/ui/services/swr"

describe("swr", () => {
  describe("useConditionallyEnabledSWR()", () => {
    test("should use the fetcher and return data when enabled, set data to undefined when disabled", async () => {
      const fetcher = vi.fn(() => "foo")

      function Component() {
        const [enabled, setEnabled] = useState(true)
        const { data } = useConditionallyEnabledSWR<string>(
          enabled,
          "test-key",
          fetcher,
        )
        return (
          <div>
            <p>data:{data === undefined ? "undefined" : data}</p>
            <button
              onClick={() => {
                setEnabled((x) => !x)
              }}
            >
              toggle
            </button>
          </div>
        )
      }

      render(<Component />)
      await screen.findByText("data:foo")
      // Initially called 2 times at this point
      expect(fetcher).toHaveBeenCalledTimes(2)

      // Change to disabled
      fireEvent.click(screen.getByText("toggle"))

      // Should reset the data and not call fetcher() again
      await screen.findByText("data:undefined")
      expect(fetcher).toHaveBeenCalledTimes(2)

      // Change to enabled
      fireEvent.click(screen.getByText("toggle"))

      // Should fetch the data and call fetcher() again
      await screen.findByText("data:foo")
      expect(fetcher).toHaveBeenCalledTimes(3)
    })
  })
})
