import { render, waitFor } from "@testing-library/react"
import type { Atom } from "jotai"
import { useAtomValue } from "jotai"
import type { FC } from "react"
import { act } from "react"
import { describe, it } from "vitest"

import { InMemoryRepository } from "../../../../shared/storage/__new/__test__/inmemoryImplementations"
import { atomFromRepo } from "../atomFromRepo"

const RenderAtom: FC<{ atom: Atom<any> }> = ({ atom }) => {
  const value = useAtomValue(atom)
  return <>{JSON.stringify(value)}</>
}

describe("atomWithSubscription", () => {
  const testRepo = new InMemoryRepository<string>({
    namespace: "test",
    defaults: [],
  })

  it("should show inital value", async () => {
    const atom = atomFromRepo(testRepo)

    const screen = render(<RenderAtom atom={atom} />)

    await waitFor(() => expect(screen.getByText("[]")).toBeInTheDocument())

    screen.unmount()
  })

  it("should show updated value", async () => {
    const atom = atomFromRepo(testRepo)

    const screen = render(<RenderAtom atom={atom} />)
    await waitFor(() => expect(screen.getByText("[]")).toBeInTheDocument())

    await act(() => {
      return testRepo.upsert("updated")
    })

    await waitFor(() =>
      expect(screen.getByText('["updated"]')).toBeInTheDocument(),
    )

    await act(() => {
      return testRepo.upsert("updated2")
    })

    await waitFor(() =>
      expect(screen.getByText('["updated","updated2"]')).toBeInTheDocument(),
    )

    screen.unmount()
  })
})
