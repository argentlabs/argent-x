import useSwr, { SWRConfiguration } from "swr"

import { getAccount } from "../services/account"
import {
  ERROR_MESSAGE_NOT_LOGGED_IN,
  UserAccount,
  getAccount as getBackendAccount,
} from "../services/backend/account"

export const useAccount = () => {
  const { data: account, ...rest } = useSwr("services/account/getAccount", () =>
    getAccount(),
  )

  return {
    ...rest,
    account,
  }
}

export const useBackendAccount = (
  config: SWRConfiguration<UserAccount, unknown> = {},
) => {
  const { data: account, ...rest } = useSwr<UserAccount>(
    "services/backend/account/getAccount",
    () => getBackendAccount(),
    {
      ...config,
      shouldRetryOnError(err) {
        // if fetch error
        if (
          err instanceof Error &&
          err.message === ERROR_MESSAGE_NOT_LOGGED_IN
        ) {
          return false
        }
        return true
      },
    },
  )

  return {
    ...rest,
    account,
  }
}
