import type { FC } from "react"
import { lazy } from "react"
import type { NftItem } from "@argent/x-shared"
import { getNftPicture } from "@argent/x-shared"
import { ImageOptimized } from "@argent/x-ui"

const LazyNftModelViewer = lazy(() => import("./NftModelViewer"))

export const NftImage: FC<{ nft: NftItem }> = ({ nft }) => (
  <>
    {nft.animation_uri ? (
      <LazyNftModelViewer nft={nft} />
    ) : (
      <ImageOptimized
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
