import { Box } from "@chakra-ui/react"
import type { FC, ReactNode } from "react"
import { buttonHoverStyle } from "@argent/x-ui/theme"

interface NftFigureProps {
  onClick: () => void
  children: ReactNode
}

const NftFigure: FC<NftFigureProps> = ({ onClick, children }) => (
  <Box
    w="100%"
    position="relative"
    as="figure"
    bg="surface-elevated"
    cursor="pointer"
    display="inline-block"
    overflow="hidden"
    data-group
    rounded="xl"
    p="2"
    onClick={onClick}
    _hover={{
      boxShadow: buttonHoverStyle.boxShadow,
    }}
    transitionProperty="common"
    transitionDuration="fast"
  >
    {children}
  </Box>
)

export { NftFigure }
