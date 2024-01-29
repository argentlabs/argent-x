import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import {
  allPreAuthorizationsView,
  isPreauthorized,
  preAuthorizationsForAccount,
  preAuthorizationsForNetworkId,
  preAuthorizationsGroupedByAccountIdentifierForNetworkId,
} from "../../views/preAuthorizations"
import { useEffect, useState } from "react"
import { getWindowURL } from "../../../shared/browser/host"

export const usePreAuthorizations = () => useView(allPreAuthorizationsView)

export const usePreAuthorizationsGroupedByAccountIdentifierForNetworkId = (
  networkId: string,
) => {
  return useView(
    preAuthorizationsGroupedByAccountIdentifierForNetworkId(networkId),
  )
}

export const usePreAuthorizationsForNetworkId = (networkId: string) => {
  return useView(preAuthorizationsForNetworkId(networkId))
}

export const usePreAuthorizationsForAccount = (account?: BaseWalletAccount) => {
  return useView(preAuthorizationsForAccount(account))
}

export const useIsPreauthorized = (
  host?: string,
  account?: BaseWalletAccount,
) => {
  return useView(isPreauthorized({ account, host }))
}

/** pre-authorizations are set using 'origin', ie. with protocol, but are still called 'host' */

export const useOriginatingPreAuthorizationHost = () => {
  const [host, setHost] = useState<string | undefined>()
  useEffect(() => {
    const init = async () => {
      const url = await getWindowURL()
      setHost(url?.origin)
    }
    void init()
  }, [])
  return host
}
