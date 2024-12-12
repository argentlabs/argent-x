import { Box } from "@chakra-ui/layout"
import type { FC, PropsWithChildren } from "react"

export const CircleIconContainer: FC<PropsWithChildren> = ({
  children,
  ...props
}) => {
  return (
    <Box
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="8"
      h="8"
      color="gray.600"
      bg="white"
      {...props}
    >
      {children}
    </Box>
  )
}
