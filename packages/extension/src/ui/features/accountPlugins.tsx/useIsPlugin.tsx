import useSWR from "swr"

import { PluginAccount } from "./PluginAccount"
import { RefreshInterval } from "../../../shared/config"

export const getIsPlugin = async (
  pluginAccount: PluginAccount,
  pluginClassHash: string,
) => {
  return await pluginAccount.isPlugin(pluginClassHash)
}

export const useIsPlugin = (
  pluginClassHash: string,
  pluginAccount?: PluginAccount,
) => {
  if (!pluginAccount) {
    throw new Error("PluginAccount is required to check plugin")
  }

  return useSWR(
    [pluginAccount.address, pluginClassHash, "getIsPlugin"],
    () => getIsPlugin(pluginAccount, pluginClassHash),
    {
      suspense: false,
      refreshInterval: RefreshInterval.SLOW * 1000,
      shouldRetryOnError: false,
    },
  )
}
