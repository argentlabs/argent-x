import { FC, lazy } from "react"
import { NftItem, getNftPicture } from "@argent/x-shared"
import { Image } from "@chakra-ui/react"

const LazyNftModelViewer = lazy(() => import("./NftModelViewer"))

export const NftImage: FC<{ nft: NftItem }> = ({ nft }) => (
  <>
    {nft.animation_uri ? (
      <LazyNftModelViewer nft={nft} />
    ) : (
      <Image
        position="relative"
        border="solid 2px"
        borderColor="transparent"
        borderRadius="lg"
        alt={nft.name ?? "NFT"}
        src={getNftPicture(nft)}
      />
    )}
  </>
)
