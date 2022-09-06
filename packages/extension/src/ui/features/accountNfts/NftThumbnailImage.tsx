import { isString } from "lodash-es"
import { FC, ImgHTMLAttributes } from "react"
import styled from "styled-components"

import { ImageNotSupportedOutlinedIcon } from "../../components/Icons/MuiIcons"

const PlaceholderSizer = styled.div`
  height: 0;
  width: 100%;
  padding-bottom: 100%;
  position: relative;
`

const Placeholder = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

type NftThumbnailImage = ImgHTMLAttributes<HTMLImageElement>

/** Transparently displays an image or palceholder fallback set to square aspect ratio */

export const NftThumbnailImage: FC<NftThumbnailImage> = ({ src, ...rest }) => {
  if (isString(src)) {
    return <img src={src} {...rest} />
  }
  return (
    <PlaceholderSizer {...rest}>
      <Placeholder>
        <ImageNotSupportedOutlinedIcon />
      </Placeholder>
    </PlaceholderSizer>
  )
}
