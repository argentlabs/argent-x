import useSWR from "swr"

import { fetchPlayOasisNfts } from "../utils/playoasis.service"
import { SWRConfigCommon } from "./useActivity"

export const useNfts = (address: string, config?: SWRConfigCommon) => {
  const { data: nfts = [], ...rest } = useSWR(
    [address, "testnet", "nfts"],
    fetchPlayOasisNfts,
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: false,
      ...config,
    },
  )

  return { nfts, ...rest }
}
