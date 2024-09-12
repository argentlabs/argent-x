import {
  NavigationBar,
  NavigationContainerProps,
  ScrollContainer,
  useScroll,
} from "@argent/x-ui"
import { Divider, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { NavigationBarAccountDetailsContainer } from "./NavigationBarAccountDetailsContainer"

export const AccountDetailsNavigationContainer: FC<
  NavigationContainerProps
> = ({ children, leftButton, ...rest }) => {
  const { scrollRef, scroll } = useScroll()
  return (
    <>
      <NavigationBar scroll={scroll} {...rest}>
        <Flex gap={2} w="full" py={2} alignItems={"center"}>
          {leftButton}
          <NavigationBarAccountDetailsContainer w="full" py={0} pl={0} pr={1} />
        </Flex>
      </NavigationBar>
      <Divider color="neutrals.600" />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
    </>
  )
}
