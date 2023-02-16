import "@testing-library/jest-dom/extend-expect"

import fetch from "cross-fetch"
import { noop } from "lodash-es"
import { vi } from "vitest"

import { chromeStorageMock } from "../src/shared/storage/__test__/chrome-storage.mock"

vi.stubGlobal("fetch", fetch)
vi.stubGlobal("chrome", {
  runtime: {
    id: "test",
  },
  storage: chromeStorageMock,
  alarms: {
    create: noop,
    set: noop,
    get: (_: unknown, cb: (result: null) => void) => cb(null),
    onAlarm: {
      addListener: noop,
    },
  },
})
