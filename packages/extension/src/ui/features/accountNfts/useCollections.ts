import { useMemo } from "react"
import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon } from "../../services/swr"
import { Collection } from "./aspect.model"
import { fetchAspectCollection } from "./aspect.service"
import { useNfts } from "./useNfts"

type SerialisedCollectibles = Record<string, Collection>

export const useCollections = (
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
): Collection[] => {
  const { nfts = [] } = useNfts(account, config)
  return useMemo(
    () =>
      Object.values(
        nfts.filter(Boolean).reduce<SerialisedCollectibles>((acc, nft) => {
          if (acc[nft.contract_address]) {
            acc[nft.contract_address].nfts.push(nft)
            return acc
          }

          return {
            ...acc,
            [nft.contract_address]: {
              name: nft.contract.name_custom || nft.contract.name || "Untitled",
              contractAddress: nft.contract.contract_address,
              imageUri: nft.contract.image_url,
              nfts: [nft],
            },
          }
        }, {}),
      ),
    [nfts],
  )
}

export const useCollection = (
  contractAddress?: string,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { data: collectible, ...rest } = useSWR(
    contractAddress &&
      account && [
        getAccountIdentifier(account),
        contractAddress,
        "collectible",
      ],
    () => fetchAspectCollection(account, contractAddress),
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { collectible, ...rest }
}
