import useSwr, { SWRConfiguration } from "swr"

import { getAccount } from "../services/account"
import {
  UserAccount,
  getAccount as getBackendAccount,
} from "../services/backend/account"

export const useAccount = () => {
  const { data: account, ...rest } = useSwr(
    "services/account/getAccount",
    () => getAccount(),
    {
      refreshInterval(latestData) {
        return latestData ? 30000 : 500
      },
    },
  )

  return {
    ...rest,
    account,
  }
}

export const useBackendAccount = (
  config: SWRConfiguration<UserAccount, unknown> = {},
) => {
  const { data: account, ...rest } = useSwr(
    "services/backend/account/getAccount",
    () => getBackendAccount(),
    config,
  )

  return {
    ...rest,
    account,
  }
}
