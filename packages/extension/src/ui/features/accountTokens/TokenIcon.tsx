import { Circle, Image } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { getColor } from "../accounts/accounts.service"

export interface TokenIconProps
  extends Pick<ComponentProps<typeof Circle>, "size">,
    ComponentProps<typeof Image> {
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
  const color = getColor(name)
  return `https://eu.ui-avatars.com/api/?name=${name}&background=${color}&color=fff`
}

export const TokenIcon: FC<TokenIconProps> = ({ name, url, size, ...rest }) => {
  const src = getTokenIconUrl({ url, name })
  return (
    <Circle position={"relative"} overflow={"hidden"} size={size}>
      <Image
        position={"absolute"}
        left={0}
        right={0}
        top={0}
        bottom={0}
        alt={name}
        src={src}
        {...rest}
      />
    </Circle>
  )
}
