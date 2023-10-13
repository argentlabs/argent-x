import { render, waitFor } from "@testing-library/react"
import { Atom, useAtomValue } from "jotai"
import { FC } from "react"
import { act } from "react-dom/test-utils"
import { beforeEach, describe, it } from "vitest"

import { atomWithSubscription } from "../atomWithSubscription"

const RenderAtom: FC<{ atom: Atom<any> }> = ({ atom }) => {
  const value = useAtomValue(atom)
  return <p>{value}</p>
}

interface Store<T> {
  get: () => Promise<T>
  set: (value: T) => void
  subscribe: (callback: (value: T) => void) => () => void
}
function createStore<T>(initial: T): Store<T> {
  let value = initial
  const callbacks = new Set<(value: T) => void>()
  return {
    get: () => new Promise((resolve) => setTimeout(() => resolve(value), 100)),
    set: (newValue) => {
      value = newValue
      callbacks.forEach((callback) => callback(value))
    },
    subscribe: (callback) => {
      callbacks.add(callback)
      return () => {
        callbacks.delete(callback)
      }
    },
  }
}

describe("atomWithSubscription", () => {
  let testStore: Store<string>
  beforeEach(() => {
    testStore = createStore("test")
  })

  it("should show inital value", async () => {
    const atom = atomWithSubscription(
      () => testStore.get(),
      (next) => testStore.subscribe(next),
    )

    const screen = render(<RenderAtom atom={atom} />)

    await waitFor(() => expect(screen.getByText("test")).toBeInTheDocument())

    screen.unmount()
  })

  it("should show updated value", async () => {
    const atom = atomWithSubscription(
      () => testStore.get(),
      (next) => testStore.subscribe(next),
    )

    const screen = render(<RenderAtom atom={atom} />)
    await waitFor(() => expect(screen.getByText("test")).toBeInTheDocument())

    act(() => {
      testStore.set("updated")
    })

    await waitFor(() => expect(screen.getByText("updated")).toBeInTheDocument())

    act(() => {
      testStore.set("updated2")
    })

    await waitFor(() =>
      expect(screen.getByText("updated2")).toBeInTheDocument(),
    )

    screen.unmount()
  })

  it("should work with multiple subscribers in one screen", async () => {
    const atom = atomWithSubscription(
      () => testStore.get(),
      (next) => testStore.subscribe(next),
    )

    const screen = render(
      <>
        <RenderAtom atom={atom} />
        <RenderAtom atom={atom} />
      </>,
    )
    await waitFor(() => expect(screen.getAllByText("test")).toHaveLength(2))

    act(() => {
      testStore.set("updated")
    })

    await waitFor(() => expect(screen.getAllByText("updated")).toHaveLength(2))

    act(() => {
      testStore.set("updated2")
    })

    await waitFor(() => expect(screen.getAllByText("updated2")).toHaveLength(2))

    screen.unmount()
  })
  it("can keep value on remount", async () => {
    const atom = atomWithSubscription(
      () => testStore.get(),
      (next) => testStore.subscribe(next),
    )

    let screen = render(
      <>
        <RenderAtom atom={atom} />
        <RenderAtom atom={atom} />
      </>,
    )
    await waitFor(() => expect(screen.getAllByText("test")).toHaveLength(2))

    act(() => {
      testStore.set("updated")
    })
    await waitFor(() => expect(screen.getAllByText("updated")).toHaveLength(2))

    screen.unmount()

    await waitFor(() =>
      expect(screen.container).toMatchInlineSnapshot("<div />"),
    )

    screen = render(
      <>
        <RenderAtom atom={atom} />
        <RenderAtom atom={atom} />
      </>,
    )

    await waitFor(() => expect(screen.getAllByText("updated")).toHaveLength(2))

    act(() => {
      testStore.set("updated2")
    })

    await waitFor(() => expect(screen.getAllByText("updated2")).toHaveLength(2))

    screen.unmount()
  })
})
