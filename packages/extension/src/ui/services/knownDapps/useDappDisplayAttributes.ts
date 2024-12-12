import { getDapplandUrlForDapp } from "@argent/x-shared"
import { upperFirst } from "lodash-es"

import type { DappDisplayAttributes } from "./types"
import { useDappFromKnownDappsByHost } from "./useDappFromKnownDappsByHost"

export const useDappDisplayAttributes = (host: string) => {
  const dapp = useDappFromKnownDappsByHost(host)

  const title = dapp?.name ? upperFirst(dapp.name) : undefined

  const iconUrl = dapp?.logoUrl

  const result: DappDisplayAttributes = {
    title,
    iconUrl,
    isKnown: !!dapp,
    dapplandUrl: getDapplandUrlForDapp(dapp),
    verified: dapp?.argentVerified,
  }

  return result
}
