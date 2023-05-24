import { useMemo } from "react"
import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon } from "../../services/swr"
import { Collection } from "./aspect.model"
import { fetchAspectCollection } from "./aspect.service"
import { useNfts } from "./useNfts"

type SerialisedCollectibles = Record<string, Collection>

export type ParsedError = {
  [key: string]: string
}

export type NftZodError = {
  code: string
  expected: string
  received: string
  path: [number, string, string]
  message: string
}

export const useCollections = (
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
): Collection[] => {
  const { nfts = [], error } = useNfts(account, config)
  return useMemo(() => {
    let parsedError = null
    let errorMap: ParsedError | null = null
    try {
      parsedError = (error && JSON.parse(error)) || []
      errorMap = parsedError.reduce((a: ParsedError[], e: NftZodError) => {
        return {
          ...a,
          [e.path[0]]: e.code,
        }
      }, {})
    } catch {
      parsedError = null
    }

    return Object.values(
      nfts
        .filter(Boolean)
        .reduce<SerialisedCollectibles>((acc, nft, currentIndex) => {
          const hasError = errorMap && errorMap[currentIndex]
          if (acc[nft.contract_address]) {
            acc[nft.contract_address].nfts.push(
              hasError ? { ...nft, image_url_copy: "" } : nft,
            )
            return acc
          }
          return {
            ...acc,
            [nft.contract_address]: {
              name: nft.contract.name_custom || nft.contract.name || "Untitled",
              contractAddress: nft.contract.contract_address,
              imageUri: nft.contract.image_url,
              nfts: [hasError ? { ...nft, image_url_copy: "" } : nft],
            },
          }
        }, {}),
    )
  }, [error, nfts])
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
