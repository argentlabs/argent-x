import { Circle, Flex, Image, ImageProps, SquareProps } from "@chakra-ui/react"
import { FC } from "react"

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
            borderColor={"black"}
          />
          <Circle
            position={"absolute"}
            top={0}
            size={size}
            borderWidth={"0.125rem"}
            borderColor={"white"}
          />
        </>
      )}
      {children}
    </Flex>
  )
}
