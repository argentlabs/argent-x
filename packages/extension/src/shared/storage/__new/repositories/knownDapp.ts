import { KnownDapp } from "@argent/shared"
import browser from "webextension-polyfill"

import { ChromeRepository } from "../chrome"
import { IRepository } from "../interface"

export type IKnownDappsRepository = IRepository<KnownDapp>

export const knownDappsRepository: IKnownDappsRepository =
  new ChromeRepository<KnownDapp>(browser, {
    areaName: "local",
    namespace: "knownDapps_v1",
    compare(a: KnownDapp, b: KnownDapp) {
      return a.dappId === b.dappId
    },
  })
