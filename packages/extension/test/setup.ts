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
