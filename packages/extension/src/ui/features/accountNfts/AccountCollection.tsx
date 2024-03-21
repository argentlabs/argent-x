import {
  Address,
  Collection,
  addressSchema,
  getNftPicture,
} from "@argent/x-shared"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { useCollectionNftsByAccountAndNetwork } from "./nfts.state"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"

interface AccountCollectionProps {
  collection: Collection
  navigateToSend?: boolean
  onClick?: (collection: Collection) => void
}

const AccountCollection: FC<AccountCollectionProps> = ({
  collection,
  navigateToSend,
  onClick: onClickProp,
}) => {
  const navigate = useNavigate()
  const selectedAccount = useView(selectedAccountView)

  const nfts = useCollectionNftsByAccountAndNetwork(
    addressSchema.parse(collection?.contractAddress),
    (selectedAccount?.address as Address) ?? "0x0",
    selectedAccount?.networkId,
  )
  const onClick = useCallback(() => {
    if (onClickProp) {
      onClickProp(collection)
    } else {
      navigate(routes.collectionNfts(collection.contractAddress), {
        state: { navigateToSend },
      })
    }
  }, [collection, navigate, navigateToSend, onClickProp])

  if (nfts.length === 0) {
    return <></>
  }

  return (
    <>
      <NftFigure key={collection.contractAddress} onClick={onClick}>
        <NftItem
          name={collection.name}
          thumbnailSrc={getNftPicture(nfts[0]) ?? ""}
          logoSrc={collection.imageUri}
          total={nfts.length}
        />
      </NftFigure>
    </>
  )
}

export { AccountCollection }
