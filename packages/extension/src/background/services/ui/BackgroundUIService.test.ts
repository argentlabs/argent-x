import { describe, expect, test, vi } from "vitest"

import type { ISettingsStorage } from "../../../shared/settings/types"
import type { KeyValueStorage } from "../../../shared/storage"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"
import BackgroundUIService from "./BackgroundUIService"
import { Opened } from "./IBackgroundUIService"

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
        getURL: vi.fn(),
      },
      windows: {
        getLastFocused: vi.fn(),
        create: vi.fn(),
      },
    }
    const uiService = {
      connectId: "test-connect-id",
      hasTab: vi.fn(),
      focusTab: vi.fn(),
      hasFloatingWindow: vi.fn(),
      focusFloatingWindow: vi.fn(),
      setDefaultSidePanel: vi.fn(),
      unsetDefaultSidePanel: vi.fn(),
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
    const walletStore = {
      get: vi.fn(),
    } as unknown as KeyValueStorage<WalletStorageProps>
    const settingsStore = {
      get: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as KeyValueStorage<ISettingsStorage>

    const backgroundUIService = new BackgroundUIService(
      emitter,
      browser,
      uiService,
      sessionService,
      walletStore,
      settingsStore,
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

    /** simulate initially open - e.g. happens when service worker restarts */
    backgroundUIService.onConnectPort(port)
    expect(backgroundUIService.opened).toBeTruthy()
    expect(port.onDisconnect.addListener).toHaveBeenCalled()

    /** no emit on initial value change */
    expect(emitter.emit).not.toHaveBeenCalled()

    /** close */
    await backgroundUIService.onDisconnectPort()
    expect(backgroundUIService.opened).toBeFalsy()
    expect(emitter.emit).toHaveBeenCalledWith(Opened, false)

    /** re-open */
    emitter.emit.mockReset()
    backgroundUIService.onConnectPort(port)
    expect(backgroundUIService.opened).toBeTruthy()
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
