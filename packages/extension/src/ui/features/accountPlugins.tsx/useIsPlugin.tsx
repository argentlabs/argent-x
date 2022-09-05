import useSWR from "swr"

import { PluginAccount } from "./PluginAccount"

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
      refreshInterval: 20 * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
}
