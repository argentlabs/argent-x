import { render, waitFor } from "@testing-library/react"
import { Atom, useAtomValue } from "jotai"
import { FC } from "react"
import { act } from "react-dom/test-utils"
import { describe, it } from "vitest"

import { InMemoryObjectStore } from "../../../../shared/storage/__new/__test__/inmemoryImplementations"
import { atomFromStore } from "../atomFromStore"

const RenderAtom: FC<{ atom: Atom<any> }> = ({ atom }) => {
  const { value } = useAtomValue(atom)
  return <>{value}</>
}

describe("atomWithSubscription", () => {
  const testStore = new InMemoryObjectStore({
    namespace: "test",
    defaults: { value: "test" },
  })

  it("should show initial value", async () => {
    const atom = atomFromStore(testStore)

    const screen = render(<RenderAtom atom={atom} />)

    await waitFor(() => expect(screen.getByText("test")).toBeInTheDocument())

    screen.unmount()
  })

  it("should show updated value", async () => {
    const atom = atomFromStore(testStore)

    const screen = render(<RenderAtom atom={atom} />)
    await waitFor(() => expect(screen.getByText("test")).toBeInTheDocument())

    await act(() => {
      return testStore.set({ value: "updated" })
    })

    await waitFor(() => expect(screen.getByText("updated")).toBeInTheDocument())

    await act(() => {
      return testStore.set({ value: "updated2" })
    })

    await waitFor(() =>
      expect(screen.getByText("updated2")).toBeInTheDocument(),
    )

    screen.unmount()
  })
})
