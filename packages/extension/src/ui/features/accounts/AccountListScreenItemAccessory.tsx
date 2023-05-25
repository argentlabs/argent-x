import { Flex } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const AccountListScreenItemAccessory: FC<PropsWithChildren> = ({
  children,
}) => (
  <Flex
    position={"absolute"}
    right={4}
    top={"50%"}
    transform={"translateY(-50%)"}
  >
    {children}
  </Flex>
)
