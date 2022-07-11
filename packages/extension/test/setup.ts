import fetch from "cross-fetch"
import { vi } from "vitest"

import { chromeStorageMock } from "../src/shared/storage/__test__/chrome-storage.mock"

vi.stubGlobal("fetch", fetch)
vi.stubGlobal("chrome", {
  runtime: {
    id: "test",
  },
  storage: chromeStorageMock,
})
// import browserMock from "./__mocks__/browser"

// /** mock global fetch() */
// vi.stubGlobal("fetch", fetch)

// /** satisfy checks to allow use of `import browser from "webextension-polyfill"` */
// vi.stubGlobal("chrome", { runtime: { id: "testid" } })

// /** mock global browser, currently for `browser.storage.local` */
// vi.stubGlobal("browser", browserMock)
