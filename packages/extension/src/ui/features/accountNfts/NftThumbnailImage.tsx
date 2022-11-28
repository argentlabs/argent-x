import { Box, Image } from "@chakra-ui/react"
import { FC, ImgHTMLAttributes } from "react"

import { ImageNotSupportedOutlinedIcon } from "../../components/Icons/MuiIcons"

type NftThumbnailImage = ImgHTMLAttributes<HTMLImageElement>

/** Transparently displays an image or palceholder fallback set to square aspect ratio */

export const NftThumbnailImage: FC<NftThumbnailImage> = ({ src, ...rest }) => {
  return (
    <Image
      src={src}
      {...rest}
      w="142px"
      h="142px"
      borderRadius="lg"
      position="relative"
      sx={{
        _groupHover: {
          transform: "scale(1.05)",
          transition: "all 0.2s ease-in-out",
        },
      }}
      fallback={
        <Box height={0} width="100%" position="relative" pb="100%" {...rest}>
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <ImageNotSupportedOutlinedIcon />
          </Box>
        </Box>
      }
    />
  )
}
