import type { Address, Collection } from "@argent/x-shared"
import {
  addressSchema,
  generateAvatarImage,
  getNftPicture,
} from "@argent/x-shared"
import type { FC } from "react"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { useCollectionNftsByAccountAndNetwork } from "./nfts.state"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { theme } from "@argent/x-ui/theme"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"

interface AccountCollectionProps {
  account: BaseWalletAccount
  collection: Collection
  navigateToSend?: boolean
  onClick?: (collection: Collection) => void
}

const AccountCollection: FC<AccountCollectionProps> = ({
  account,
  collection,
  navigateToSend,
  onClick: onClickProp,
}) => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()

  const nfts = useCollectionNftsByAccountAndNetwork(
    addressSchema.parse(collection?.contractAddress),
    account.address as Address,
    account.networkId,
  )

  const onClick = useCallback(() => {
    if (onClickProp) {
      onClickProp(collection)
    } else {
      navigate(routes.collectionNfts(collection.contractAddress, returnTo), {
        state: { navigateToSend },
      })
    }
  }, [collection, navigate, navigateToSend, onClickProp, returnTo])

  const thumbnailSrc =
    nfts.length > 0
      ? (getNftPicture(nfts[0]) ?? collection.imageUri)
      : collection.imageUri

  const logoSrc = useMemo(() => {
    if (collection.imageUri) {
      return collection.imageUri
    }
    return generateAvatarImage(collection.name, {
      background: theme.colors["neutrals.700"],
    })
  }, [collection.imageUri, collection.name])

  return (
    <NftFigure key={collection.contractAddress} onClick={onClick}>
      <NftItem
        name={collection.name}
        thumbnailSrc={thumbnailSrc}
        logoSrc={logoSrc}
        total={nfts.length}
      />
    </NftFigure>
  )
}

export { AccountCollection }
