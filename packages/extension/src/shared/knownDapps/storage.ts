import type { KnownDapp } from "@argent/x-shared"

import { ChromeRepository } from "../storage/__new/chrome"
import type { IRepository } from "../storage/__new/interface"
import { browserStorage } from "../storage/browser"

export type IKnownDappsRepository = IRepository<KnownDapp>

export const knownDappsRepository: IKnownDappsRepository =
  new ChromeRepository<KnownDapp>(browserStorage, {
    areaName: "local",
    namespace: "knownDapps_v1",
    compare(a: KnownDapp, b: KnownDapp) {
      return a.dappId === b.dappId
    },
  })
