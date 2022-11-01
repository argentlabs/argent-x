import { Flex } from "@chakra-ui/react"
import { PropsWithChildren, forwardRef } from "react"

import { scrollbarStyle } from "../theme"

export const ScrollContainer = forwardRef<HTMLDivElement, PropsWithChildren>(
  (props, ref) => {
    return (
      <Flex
        ref={ref}
        flex={1}
        direction={"column"}
        overflow={"overlay"}
        sx={scrollbarStyle}
        {...props}
      />
    )
  },
)
ScrollContainer.displayName = "ScrollContainer"
