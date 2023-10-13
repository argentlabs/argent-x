import { addressSchema } from "@argent/shared"
import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useNft } from "./nfts.state"
import { NftScreen } from "./NftScreen"

export const NftScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { contractAddress, tokenId } = useParams()
  const account = useView(selectedAccountView)

  const nft = useNft(addressSchema.parse(contractAddress), tokenId)

  if (!account || !contractAddress || !tokenId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!nft) {
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
        title="Not found"
      />
    )
  }

  return (
    <NftScreen
      contractAddress={addressSchema.parse(contractAddress)}
      networkId={account.networkId}
      tokenId={tokenId}
      nft={nft}
    />
  )
}
