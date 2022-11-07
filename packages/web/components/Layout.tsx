import { Box, BoxProps } from "@chakra-ui/react"
import { PropsWithChildren } from "react"
import { FC } from "react"

import { Header } from "./Header"
import { WithFooter } from "./WithFooter"

const Content: FC<BoxProps> = ({ children, ...props }) => (
  <Box
    p={4}
    px={5}
    flex="1"
    display="flex"
    alignItems="center"
    justifyContent="center"
    flexDirection="column"
    margin="max(32px, 12vh) auto"
    {...props}
  >
    {children}
  </Box>
)

export const Layout: FC<BoxProps> = ({ children, ...props }) => {
  return (
    <WithFooter>
      <Header />
      <Content {...props}>{children}</Content>
    </WithFooter>
  )
}
