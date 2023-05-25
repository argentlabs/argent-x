import { useColorModeValue } from "@chakra-ui/color-mode"
import { Box, Text } from "@chakra-ui/layout"
import { FC, PropsWithChildren } from "react"

export const WarningText: FC<PropsWithChildren> = ({ children }) => {
  const yellow = useColorModeValue("yellow.500", "yellow.300")
  return (
    <Box textAlign="center">
      <Text color={yellow} fontSize="sm" lineHeight="shorter">
        {children}
      </Text>
    </Box>
  )
}
