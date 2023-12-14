import { createTRPCProxyClient } from "@trpc/client"
import { chromeLink } from "trpc-browser/link"
import { autoReconnect } from "trpc-browser/shared/chrome"
import browser from "webextension-polyfill"

import type { AppRouter } from "../../../background/__new/router"

const initalPort = browser.runtime.connect()
let _messageClient = createTRPCProxyClient<AppRouter>({
  links: [chromeLink({ port: initalPort })],
})

if (typeof window === "undefined") {
  throw new Error("This file should only be imported in the UI")
}

// setup auto-reconnect
void autoReconnect(
  initalPort,
  () => browser.runtime.connect(),
  (newPort) => {
    console.log("Reconnecting to new port", newPort.name)
    _messageClient = createTRPCProxyClient<AppRouter>({
      links: [chromeLink({ port: newPort })],
    })
  },
)

const getProxyHandler = (path: string[] = []): ProxyHandler<any> => ({
  get: function (target: any, prop: string) {
    const isTrpcMethod = ["mutate", "query", "subscription"].includes(prop)
    const canBeProxied =
      (typeof target[prop] === "object" && target[prop] !== null) || // objects other than null
      typeof target[prop] === "function" // and functions

    if (isTrpcMethod || !canBeProxied) {
      // if it's a trpc method or can't be proxied, return the value from the mutable instance
      return [...path, prop].reduce(
        (acc, curr) => acc[curr],
        _messageClient as any,
      )
    }

    // otherwise, return a new proxy of the nested property, and run this function recursively
    return new Proxy(target[prop], getProxyHandler([...path, prop]))
  },
})

// Proxy to export a stable reference
export const messageClient: typeof _messageClient = new Proxy(
  _messageClient,
  getProxyHandler(),
)
