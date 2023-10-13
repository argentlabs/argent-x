import { describe, expect, test, vi } from "vitest"

import BackgroundUIService from "./background"
import { Opened } from "./interface"

describe("BackgroundUIService", () => {
  const makeService = () => {
    const browser = {
      runtime: {
        connect: vi.fn(),
        onConnect: {
          addListener: vi.fn(),
        },
        onDisconnect: {
          addListener: vi.fn(),
        },
      },
    }
    const uiService = {
      connectId: "test-connect-id",
      hasTab: vi.fn(),
    }
    const emitter = {
      anyEvent: vi.fn(),
      bindMethods: vi.fn(),
      clearListeners: vi.fn(),
      debug: vi.fn(),
      emit: vi.fn(),
      emitSerial: vi.fn(),
      events: vi.fn(),
      listenerCount: vi.fn(),
      off: vi.fn(),
      offAny: vi.fn(),
      on: vi.fn(),
      onAny: vi.fn(),
      once: vi.fn(),
    }
    const sessionService = {
      locked: false,
      emitter,
    }

    const backgroundUIService = new BackgroundUIService(
      emitter,
      browser,
      uiService,
      sessionService,
    )
    return {
      backgroundUIService,
      uiService,
      browser,
      emitter,
    }
  }
  test("open / close lifecycle", async () => {
    const { backgroundUIService, uiService, emitter } = makeService()
    const port = {
      name: uiService.connectId,
      onDisconnect: {
        addListener: vi.fn(),
      },
    }

    /** open */
    backgroundUIService.onConnectPort(port)
    expect(backgroundUIService.opened).toBeTruthy()
    expect(port.onDisconnect.addListener).toHaveBeenCalled()
    expect(emitter.emit).toHaveBeenCalledWith(Opened, true)

    /** should not fire again */
    emitter.emit.mockReset()
    backgroundUIService.onConnectPort(port)
    expect(emitter.emit).not.toHaveBeenCalled()

    /** close */
    await backgroundUIService.onDisconnectPort()
    expect(backgroundUIService.opened).toBeFalsy()
    expect(emitter.emit).toHaveBeenCalledWith(Opened, false)

    /** should not fire again */
    emitter.emit.mockReset()
    await backgroundUIService.onDisconnectPort()
    expect(emitter.emit).not.toHaveBeenCalled()
  })
})
