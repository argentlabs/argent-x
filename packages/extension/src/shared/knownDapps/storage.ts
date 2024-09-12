import { KnownDapp } from "@argent/x-shared"
import browser from "webextension-polyfill"

import { ChromeRepository } from "../storage/__new/chrome"
import { IRepository } from "../storage/__new/interface"

export type IKnownDappsRepository = IRepository<KnownDapp>

export const knownDappsRepository: IKnownDappsRepository =
  new ChromeRepository<KnownDapp>(browser, {
    areaName: "local",
    namespace: "knownDapps_v1",
    compare(a: KnownDapp, b: KnownDapp) {
      return a.dappId === b.dappId
    },
  })
