import mitt, { Handler } from "mitt"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MessageExchange, Messenger, WindowMessenger } from "./messenger"

// Mock the window object
const getMockWindow = (origin: string): Window => {
  const window = {} as Window
  const emitter = mitt<{ message: { data: unknown; origin: string } }>()
  const listeners = new Map<
    EventListener,
    Handler<{
      data: unknown
      origin: string
    }>
  >()

  const buildEvent = (options: {
    data: unknown
    origin: string
  }): MessageEvent => {
    return {
      data: options.data,
      origin: options.origin,
    } as MessageEvent
  }

  window.addEventListener = vi.fn((_type, listener: EventListener) => {
    listeners.set(listener, (message) => {
      listener(buildEvent(message))
    })
    emitter.on("message", listeners.get(listener) as any)
  })

  window.removeEventListener = vi.fn((_type, listener: EventListener) => {
    if (listeners.has(listener)) {
      emitter.off("*", listeners.get(listener) as any)
      listeners.delete(listener)
    }
  })

  window.postMessage = vi.fn((message: unknown) => {
    emitter.emit("message", {
      data: message,
      origin,
    })
  }) as any

  return window
}

describe("WindowMessenger", () => {
  let window0: Window
  let window1: Window
  let origin1: string

  beforeEach(() => {
    window0 = {} as Window
    window1 = {} as Window
    origin1 = "http://localhost:3001"

    // Set up the mock window objects
    window0.addEventListener = vi.fn()
    window1.addEventListener = vi.fn()
    window0.postMessage = vi.fn() as any
    window1.postMessage = vi.fn() as any
  })

  it("should not add a message event listener to the listen window (lazy)", () => {
    // Create a new WindowMessenger instance
    new WindowMessenger({
      listenWindow: window0,
      postWindow: window1,
      postOrigin: origin1,
    })

    expect(window0.addEventListener).toHaveBeenCalledTimes(0)
  })

  it("should post a message to the post window", () => {
    const message = { some: "message" }

    // Create a new WindowMessenger instance
    const messenger = new WindowMessenger({
      listenWindow: window0,
      postWindow: window1,
      postOrigin: origin1,
    })

    // Send a message
    messenger.postMessage(message)

    // Check that the postMessage method was called on the post window with the correct arguments
    expect(window1.postMessage).toHaveBeenCalledTimes(1)
    expect(window1.postMessage).toHaveBeenCalledWith(message, origin1)
  })
})

describe("MessageExchange", () => {
  const origin0 = "http://localhost:3000"
  const origin1 = "http://localhost:3001"

  let messenger1: Messenger
  let messenger2: Messenger
  const methods = {
    someMethod: vi.fn(() => {
      return "some-result"
    }),
    someOtherMethod: () => {
      throw new Error("some-error")
    },
  }

  let exchange1: MessageExchange<typeof methods, {}>
  let exchange2: MessageExchange<{}, typeof methods>

  beforeEach(() => {
    // Create a new WindowMessenger instance
    const window0 = getMockWindow(origin0)
    const window1 = getMockWindow(origin0)

    messenger1 = new WindowMessenger({
      listenWindow: window0,
      postWindow: window1,
      postOrigin: origin1,
    })
    messenger2 = new WindowMessenger({
      listenWindow: window1,
      postWindow: window0,
      postOrigin: origin0,
    })

    // Create a new MessageExchange instance
    exchange1 = new MessageExchange(messenger1, {})
    exchange2 = new MessageExchange(messenger2, methods)
  })

  afterEach(() => {
    // Reset the mocked methods
    methods.someMethod.mockReset()

    // Destroy the MessageExchange instance
    exchange1.destroy()
    exchange2.destroy()
  })

  it("should call a method and return the result", async () => {
    // Call the someMethod method
    const result = await exchange1.call("someMethod")

    // Check that the method was called with the correct arguments
    expect(methods.someMethod).toHaveBeenCalledTimes(1)
    expect(methods.someMethod).toHaveBeenCalledWith([], "http://localhost:3000")

    // Check that the call returned the expected result
    expect(result).toBe("some-result")
  })

  it("should call a method and throw an error", () => {
    // Call the someOtherMethod method
    const result = exchange1.call("someOtherMethod")

    // Check that the call threw the expected error
    expect(result).rejects.toThrow("some-error")
  })
})
