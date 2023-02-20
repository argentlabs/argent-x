import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Message } from "../messenger"
import { WindowMessenger } from "../messenger/window"
import { getMockWindow } from "./windowMock.mock"

describe("WindowMessenger", () => {
  let messenger: WindowMessenger
  beforeEach(() => {
    const postWindow = getMockWindow("http://localhost:3000")
    messenger = new WindowMessenger(postWindow)
  })
  it("should add and remove listeners", () => {
    const listener = vi.fn()
    messenger.addListener(listener)
    messenger.removeListener(listener)
  })
  it("should post a message to the post window", () => {
    const listener = vi.fn()
    messenger.addListener(listener)

    const requestMessage = {
      id: "1",
      type: "REQ",
      method: "someMethod",
      args: ["a", "b"],
    } satisfies Message

    messenger.postMessage(requestMessage)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(
      requestMessage,
      "http://localhost:3000",
    )

    messenger.removeListener(listener)
  })
})
