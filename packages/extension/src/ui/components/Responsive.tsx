import type { BoxProps, FlexProps } from "@chakra-ui/react"
import { Box, Flex } from "@chakra-ui/react"
import type { FC } from "react"

import { useExtensionIsInTab } from "../features/browser/tabs"

export const ResponsiveBox: FC<BoxProps> = (props) => {
  return <Box mx={[0, "10%"]} {...props} />
}

export const AppDimensions: FC<BoxProps> = (props) => {
  const extensionIsInTab = useExtensionIsInTab()
  return (
    <Box
      width={extensionIsInTab ? "100vw" : "360px"}
      height={extensionIsInTab ? "100vh" : "600px"}
      {...props}
    />
  )
}

export const ResponsiveAppContainer: FC<FlexProps> = (props) => {
  return (
    <Flex
      mx={[0, "10%"]}
      direction="column"
      position="relative"
      h="100vh"
      overflowY="hidden"
      overscrollBehavior="none"
      sx={{
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
      {...props}
    />
  )
}
