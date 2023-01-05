import { Flex, FlexProps, forwardRef } from "@chakra-ui/react"

import { scrollbarStyle } from "../theme"

export const ScrollContainer = forwardRef<FlexProps, "div">((props, ref) => {
  return (
    <Flex
      ref={ref}
      flex={1}
      direction={"column"}
      minHeight={0}
      overflowY={"auto"} /** FireFox */
      overflow={"overlay"}
      sx={scrollbarStyle}
      {...props}
    />
  )
})
ScrollContainer.displayName = "ScrollContainer"
