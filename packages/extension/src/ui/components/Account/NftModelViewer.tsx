import "@google/model-viewer/lib/model-viewer"

import { FC } from "react"

import { PlayOasisNft } from "../../utils/playoasis.model"
import { getNftPicture } from "../../utils/playoasis.service"

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<any, any>
    }
  }
}

interface NftModelViewerProps {
  nft: PlayOasisNft
}

const NftModelViewer: FC<NftModelViewerProps> = ({ nft }) => (
  <model-viewer
    src={nft.animation_url}
    alt={`3D model of ${nft.name}`}
    poster={getNftPicture(nft)}
    auto-rotate
    camera-controls
    shadow-intensity="1"
    poster-color="transparent"
    ar
  />
)

export default NftModelViewer
