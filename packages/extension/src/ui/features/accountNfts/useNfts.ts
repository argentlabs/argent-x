import useSWR from "swr"

import { SWRConfigCommon } from "../../services/swr"
import { fetchAspectNfts } from "./aspect.service"

export const useNfts = (address: string, config?: SWRConfigCommon) => {
  const { data: nfts = [], ...rest } = useSWR(
    [address, "goerli-alpha", "nfts"],
    fetchAspectNfts,
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { nfts, ...rest }
}
