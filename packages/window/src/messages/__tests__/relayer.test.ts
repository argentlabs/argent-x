import { beforeEach, describe, expect, it, vi } from "vitest"

import { Relayer } from "../exchange/relayer"
import { Message, Messenger } from "../messenger"
import { WindowMessenger } from "../messenger/window"
import { getMockWindow } from "./windowMock.mock"

describe("Relayer", () => {
  let window1: Window
  let window2: Window
  let window3: Window
  let messenger1: Messenger
  let messenger2: Messenger
  let messenger3: Messenger

  beforeEach(() => {
    window1 = getMockWindow("http://localhost:3000")
    window2 = getMockWindow("http://localhost:3001")
    window3 = getMockWindow("http://localhost:3002")
    messenger1 = new WindowMessenger(window1)
    messenger2 = new WindowMessenger(window2)
    messenger3 = new WindowMessenger(window3)
  })

  it("should forward messages from messenger1 to messenger2", () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const message = {
      id: "1",
      type: "REQUEST",
      method: "someMethod",
      args: ["a", "b"],
    } satisfies Message

    messenger2.addListener(listener1)
    messenger2.addListener(listener2)
    const relayer = new Relayer(messenger1, messenger2)
    messenger1.postMessage(message)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(
      {
        ...message,
        meta: { forwardedBy: [relayer.id] },
      },
      "http://localhost:3001",
    )

    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(
      {
        ...message,
        meta: { forwardedBy: [relayer.id] },
      },
      "http://localhost:3001",
    )
  })

  it("should forward messages from messenger2 to messenger1", () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const message = {
      id: "1",
      type: "REQUEST",
      method: "someMethod",
      args: ["a", "b"],
    } satisfies Message

    messenger1.addListener(listener1)
    messenger1.addListener(listener2)
    const relayer = new Relayer(messenger1, messenger2)
    messenger2.postMessage(message)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(
      {
        ...message,
        meta: { forwardedBy: [relayer.id] },
      },
      "http://localhost:3000",
    )

    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(
      {
        ...message,
        meta: { forwardedBy: [relayer.id] },
      },
      "http://localhost:3000",
    )
  })

  it("should not forward messages from messenger1 to messenger3, through messenger2", () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const listener3 = vi.fn()
    const message = {
      id: "1",
      type: "REQUEST",
      method: "someMethod",
      args: ["a", "b"],
    } satisfies Message

    messenger2.addListener(listener1)
    messenger2.addListener(listener2)
    messenger3.addListener(listener3)
    const relayer1 = new Relayer(messenger1, messenger2)
    const relayer2 = new Relayer(messenger2, messenger3)
    messenger1.postMessage(message)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(
      {
        ...message,
        meta: { forwardedBy: [relayer1.id] },
      },
      "http://localhost:3001",
    )

    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(
      {
        ...message,
        meta: { forwardedBy: [relayer1.id] },
      },
      "http://localhost:3001",
    )

    expect(listener3).toHaveBeenCalledTimes(1)
    expect(listener3).toHaveBeenCalledWith(
      {
        ...message,
        meta: { forwardedBy: [relayer1.id, relayer2.id] },
      },
      "http://localhost:3002",
    )
  })
})
