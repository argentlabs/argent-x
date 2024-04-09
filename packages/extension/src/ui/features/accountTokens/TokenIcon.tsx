import { Circle, Image, ImageProps, SquareProps } from "@chakra-ui/react"
import { FC } from "react"

import { generateAvatarImage } from "@argent/x-shared"
import { getColor } from "../accounts/accounts.service"

export interface TokenIconProps extends Pick<SquareProps, "size">, ImageProps {
  name: string
  url?: string
  iconUrl?: string
  image?: string
}

export const getTokenIconUrl = ({
  name,
  url,
  iconUrl,
  image,
}: Pick<TokenIconProps, "name" | "url" | "iconUrl" | "image">) => {
  const imgUrl = url || iconUrl || image
  if (imgUrl && imgUrl.length) {
    return imgUrl
  }

  const background = getColor(name)
  return generateAvatarImage(name, { background })
}

export const TokenIcon: FC<TokenIconProps> = ({
  name,
  url,
  iconUrl,
  image,
  size,
  ...rest
}) => {
  const src = getTokenIconUrl({ url, iconUrl, image, name })
  return (
    <Circle position={"relative"} overflow={"hidden"} size={size} {...rest}>
      <Image
        position={"absolute"}
        left={0}
        right={0}
        top={0}
        bottom={0}
        alt={name}
        src={src}
      />
    </Circle>
  )
}
