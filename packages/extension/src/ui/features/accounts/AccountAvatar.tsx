import { Circle, Flex, Image } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

export interface AccountAvatarProps extends ComponentProps<"img"> {
  outlined?: boolean
}

export const AccountAvatar: FC<AccountAvatarProps> = ({
  outlined,
  children,
  ...rest
}) => {
  return (
    <Flex position={"relative"} flexShrink={0}>
      <Image borderRadius={"full"} width={12} height={12} {...rest} />
      {outlined && (
        <>
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.25rem"}
            borderColor={"black"}
          />
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.125rem"}
            borderColor={"white"}
          />
        </>
      )}
      {children}
    </Flex>
  )
}
