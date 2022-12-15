import { Box } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

interface NftFigureProps {
  onClick: () => void
  children: ReactNode
}

const NftFigure: FC<NftFigureProps> = ({ onClick, children }) => (
  <Box
    w="160px"
    h="192px"
    position="relative"
    as="figure"
    bg="neutrals.800"
    cursor="pointer"
    display="inline-block"
    overflow="hidden"
    data-group
    borderRadius="lg"
    p="2"
    onClick={onClick}
    _hover={{ backgroundColor: "neutrals.700" }}
  >
    {children}
  </Box>
)

export { NftFigure }
