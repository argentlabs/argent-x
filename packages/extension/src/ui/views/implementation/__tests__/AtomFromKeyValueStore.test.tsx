import { render, waitFor } from "@testing-library/react"
import { Atom, useAtomValue } from "jotai"
import { FC } from "react"
import { act } from "react-dom/test-utils"
import { describe, it } from "vitest"

import { InMemoryKeyValueStore } from "../../../../shared/storage/__new/__test__/inmemoryImplementations"
import { atomFromKeyValueStore } from "../atomFromKeyValueStore"

const RenderAtom: FC<{ atom: Atom<any> }> = ({ atom }) => {
  const value = useAtomValue(atom)
  return <>{value}</>
}

describe("atomWithSubscription", () => {
  const testStore = new InMemoryKeyValueStore({
    namespace: "test",
    defaults: { value: "defaultValue" } as Record<
      string | number | symbol,
      any
    >,
  })

  it("should show inital value", async () => {
    const spy = vi.spyOn(testStore, "get")
    const atom = atomFromKeyValueStore(testStore, "value")

    const screen = render(<RenderAtom atom={atom} />)
    await waitFor(() => {
      expect(screen.getByText("defaultValue")).toBeInTheDocument()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    screen.unmount()
  })

  it("should show updated value", async () => {
    const atom = atomFromKeyValueStore(testStore, "value")

    let screen = render(<RenderAtom atom={atom} />)
    await waitFor(() =>
      expect(screen.getByText("defaultValue")).toBeInTheDocument(),
    )

    await act(() => {
      return testStore.set("value", "updated")
    })

    await waitFor(() => expect(screen.getByText("updated")).toBeInTheDocument())

    screen.unmount()

    await act(() => {
      return testStore.set("value", "updated2")
    })

    screen = render(<RenderAtom atom={atom} />)

    await waitFor(() => {
      expect(screen.getByText("updated2")).toBeInTheDocument()
    })

    screen.unmount()
  })
})
