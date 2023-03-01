import { beforeEach, describe, expect, it, vi } from "vitest"

import { BidirectionalExchange, Methods } from "../exchange/bidirectional"
import { Relayer } from "../exchange/relayer"
import { Messenger } from "../messenger"
import { WindowMessenger } from "../messenger/window"
import { getMockWindow } from "./windowMock.mock"

describe("Bidirectional Exchange", () => {
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

  it("should call a method on the other side and return the result", async () => {
    interface ExampleMethods extends Methods {
      add: (a: number, b: number) => number
    }

    const caller = new BidirectionalExchange<ExampleMethods, {}>(
      messenger1,
      messenger2,
      {},
    )
    new BidirectionalExchange<{}, ExampleMethods>(messenger2, messenger1, {
      add() {
        return (a, b) => a + b
      },
    })

    const result = await caller.call("add", 1, 2)

    expect(result).toBe(3)
  })

  it("should call a method on the other side and only the other side", async () => {
    interface ExampleMethods extends Methods {
      add: (a: number, b: number) => number
    }

    const addition1 = vi.fn((a, b) => a + b)
    const addition2 = vi.fn((a, b) => a + b)
    const caller = new BidirectionalExchange<ExampleMethods, ExampleMethods>(
      messenger1,
      messenger2,
      {
        add: () => addition1,
      },
    )
    new BidirectionalExchange<{}, ExampleMethods>(messenger2, messenger1, {
      add: () => addition2,
    })

    const result = await caller.call("add", 1, 2)

    expect(result).toBe(3)
    expect(addition1).toHaveBeenCalledTimes(0)
    expect(addition2).toHaveBeenCalledTimes(1)
  })

  it("should call a method on the other side, through a relay", async () => {
    interface ExampleMethods extends Methods {
      add: (a: number, b: number) => number
    }

    const addition1 = vi.fn((a, b) => a + b)
    const addition2 = vi.fn((a, b) => a + b)
    const caller = new BidirectionalExchange<ExampleMethods, ExampleMethods>(
      messenger1,
      messenger2,
      {
        add: () => addition1,
      },
    )
    new Relayer(messenger2, messenger3)
    new BidirectionalExchange<{}, ExampleMethods>(messenger3, messenger2, {
      add: () => addition2,
    })
    new Relayer(messenger2, messenger1)

    const result = await caller.call("add", 1, 2)

    expect(result).toBe(3)
    expect(addition1).toHaveBeenCalledTimes(0)
    expect(addition2).toHaveBeenCalledTimes(1)
  })
})
