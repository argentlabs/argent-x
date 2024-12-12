import { Box, Text } from "@chakra-ui/layout"
import type { FC, PropsWithChildren } from "react"

export const WarningText: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      textAlign="center"
      backgroundColor="warningDark.500"
      p={3}
      borderRadius="xl"
    >
      <Text
        color="warning.500"
        fontSize={12}
        lineHeight="shorter"
        fontWeight="bold"
      >
        {children}
      </Text>
    </Box>
  )
}
