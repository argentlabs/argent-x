import { generateAvatarImage, getColor } from "@argent/shared"
import { Circle, Image, ImageProps } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

export interface TokenIconProps
  extends Pick<ComponentProps<typeof Circle>, "size">,
    ImageProps {
  name: string
  url?: string
}

export const getTokenIconUrl = ({
  url,
  name,
}: Pick<TokenIconProps, "url" | "name">) => {
  if (url && url.length) {
    return url
  }
  const background = getColor(name)
  return generateAvatarImage(name, { background })
}

export const TokenIcon: FC<TokenIconProps> = ({ name, url, size, ...rest }) => {
  const src = getTokenIconUrl({ url, name })
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
