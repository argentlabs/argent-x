import useSWR from "swr"

import { SWRConfigCommon } from "../../services/swr"
import { fetchPlayOasisNfts } from "./playoasis.service"

export const useNfts = (address: string, config?: SWRConfigCommon) => {
  const { data: nfts = [], ...rest } = useSWR(
    [address, "testnet", "nfts"],
    fetchPlayOasisNfts,
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { nfts, ...rest }
}
