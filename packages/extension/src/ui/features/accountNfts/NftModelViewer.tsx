import "@google/model-viewer/dist/model-viewer"

import { FC } from "react"

import { AspectNft } from "./aspect.model"
import { getNftPicture } from "./aspect.service"

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<any, any>
    }
  }
}

interface NftModelViewerProps {
  nft: AspectNft
}

const NftModelViewer: FC<NftModelViewerProps> = ({ nft }) => (
  <model-viewer
    src={nft.animation_uri}
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
