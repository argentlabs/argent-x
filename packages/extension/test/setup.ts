import "@testing-library/jest-dom"

import fetch, { Headers, Request, Response } from "cross-fetch"
import dotenv from "dotenv"
import { noop } from "lodash-es"
import { vi } from "vitest"

import { chromeStorageMock } from "../src/shared/storage/__test__/chrome-storage.mock"

Node.prototype.isSameNode = function (otherNode) {
  return otherNode === null ? false : this === otherNode
}

dotenv.config()

vi.stubGlobal("fetch", fetch)
vi.stubGlobal("Headers", Headers)
vi.stubGlobal("Request", Request)
vi.stubGlobal("Response", Response)
vi.stubGlobal("chrome", {
  runtime: {
    id: "test",
    connect: () => ({
      onDisconnect: {
        addListener: noop,
      },
    }),
    onConnect: {
      addListener: noop,
    },
    sendMessage: noop,
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
