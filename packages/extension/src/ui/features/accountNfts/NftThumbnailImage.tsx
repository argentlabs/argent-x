import { Flex, Image, Spinner } from "@chakra-ui/react"
import { FC, ImgHTMLAttributes } from "react"

import { NftFallback } from "./NftFallback"

type NftThumbnailImage = ImgHTMLAttributes<HTMLImageElement>

/** Transparently displays an image or palceholder fallback set to square aspect ratio */

export const NftThumbnailImage: FC<NftThumbnailImage> = ({ src, ...rest }) => {
  if (!src) {
    return <NftFallback />
  }
  return (
    <Image
      src={src}
      {...rest}
      w="142px"
      h="142px"
      borderRadius="lg"
      position="relative"
      fallback={
        <Flex w="142px" h="142px" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      }
    />
  )
}
