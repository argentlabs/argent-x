import useSWR from "swr"

import { SWRConfigCommon, getAccountIdentifier } from "../http/swr"
import { fetchAspectNfts } from "./aspect"

export const useNfts = (
  account?: any,
  networkId?: string,
  config?: SWRConfigCommon,
) => {
  const { data: nfts = [], ...rest } = useSWR(
    account && [getAccountIdentifier(account), "nfts"],
    () =>
      account &&
      fetchAspectNfts(account.address, networkId || account.networkId),
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { nfts, ...rest }
}
