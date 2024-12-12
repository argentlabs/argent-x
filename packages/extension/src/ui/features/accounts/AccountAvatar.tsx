import type { ImageProps, SquareProps } from "@chakra-ui/react"
import { Circle, Flex, Image } from "@chakra-ui/react"
import type { FC } from "react"

export interface AccountAvatarProps
  extends ImageProps,
    Pick<SquareProps, "size"> {
  outlined?: boolean
}

export const AccountAvatar: FC<AccountAvatarProps> = ({
  size = 12,
  outlined,
  children,
  ...rest
}) => {
  return (
    <Flex position={"relative"} flexShrink={0}>
      <Image borderRadius={"full"} width={size} height={size} {...rest} />
      {outlined && (
        <>
          <Circle
            position={"absolute"}
            top={0}
            size={size}
            borderWidth={"0.25rem"}
            borderColor={"surface-default"}
          />
          <Circle
            position={"absolute"}
            top={0}
            size={size}
            borderWidth={"0.125rem"}
            borderColor={"text-primary"}
          />
        </>
      )}
      {children}
    </Flex>
  )
}
