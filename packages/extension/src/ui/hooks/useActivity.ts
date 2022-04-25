import useSWR from "swr"

import { Network } from "../../shared/networks"
import { fetchActivity } from "../components/Account/accountActivity.service"

export interface SWRConfigCommon {
  suspense?: boolean
  refreshInterval?: number
  errorRetryInterval?: number
}

export function useActivity(
  address: string,
  network: Network,
  config?: SWRConfigCommon,
) {
  const { data: activity = {}, ...rest } = useSWR(
    [address, network, "activity"],
    fetchActivity,
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )
  return { activity, ...rest }
}
