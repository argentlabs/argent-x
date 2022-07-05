import { fireEvent, render, screen } from "@testing-library/react"
import { describe, test } from "vitest"

import { useObjectStorage } from "../hooks"
import { ObjectStorage } from "../object"
import { chromeStorageMock } from "./chrome-storage-mock"

describe("useObjectStorage()", () => {
  test("should render with storage values", async () => {
    const store = new ObjectStorage(
      "Hello World!",
      "ui-test",
      chromeStorageMock,
    )
    function Component() {
      const data = useObjectStorage(store)
      return (
        <div>
          <p>{data}</p>
          <button
            onClick={() => {
              store.set("Bye World!")
            }}
          >
            change value
          </button>
        </div>
      )
    }
    render(<Component />)
    await screen.findByText("Hello World!")
    // Change to disabled
    fireEvent.click(screen.getByText("change value"))
    // Should reset the data and not call fetcher() again
    await screen.findByText("Bye World!")
  })
})
