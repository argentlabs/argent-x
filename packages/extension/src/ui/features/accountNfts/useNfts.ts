import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon } from "../../services/swr"
import { baseUrl, fetchAspectNfts } from "./aspect.service"

export const useNfts = (
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { data: nfts = [], ...rest } = useSWR(
    account && [(getAccountIdentifier(account), "nfts")],
    () => account && fetchAspectNfts(account, baseUrl),
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { nfts, ...rest }
}
