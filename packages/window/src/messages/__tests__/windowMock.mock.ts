import { vi } from "vitest"

import { Handler, mittx } from "../../utils/mittx"

// Mock the window object
export const getMockWindow = (origin: string): Window => {
  const window = {} as Window
  const emitter = mittx<{ message: { data: unknown; origin: string } }>()
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
      emitter.off("message", listeners.get(listener) as any)
      listeners.delete(listener)
    }
  })

  window.postMessage = vi.fn((message: unknown, _targetOrigin: string) => {
    emitter.emit("message", {
      data: message,
      origin,
    })
  }) as any

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.origin = origin

  return window
}
