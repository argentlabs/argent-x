import "@testing-library/jest-dom"

import fetch, { Headers, Request, Response } from "cross-fetch"
import { noop } from "lodash-es"
import { vi } from "vitest"

vi.stubGlobal("fetch", fetch)
vi.stubGlobal("Headers", Headers)
vi.stubGlobal("Request", Request)
vi.stubGlobal("Response", Response)
vi.stubGlobal("chrome", {
  runtime: {
    id: "test",
  },
  alarms: {
    create: noop,
    set: noop,
    get: (_: unknown, cb: (result: null) => void) => cb(null),
    onAlarm: {
      addListener: noop,
    },
  },
})
