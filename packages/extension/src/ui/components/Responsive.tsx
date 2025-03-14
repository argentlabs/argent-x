import type { BoxProps, FlexProps } from "@chakra-ui/react"
import { Box, Flex } from "@chakra-ui/react"
import type { FC, PropsWithChildren } from "react"

export const ResponsiveBox: FC<BoxProps> = (props) => {
  return <Box mx={[0, "10%"]} {...props} />
}

export const AppDimensions: FC<PropsWithChildren> = (props) => {
  return <Box width="100vw" height="100vh" {...props} />
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
