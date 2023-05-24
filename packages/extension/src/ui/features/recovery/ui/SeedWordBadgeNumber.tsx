import { Box } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const SeedWordBadgeNumber: FC<PropsWithChildren> = ({
  children,
  ...props
}) => {
  return (
    <Box
      fontWeight="600"
      borderRadius="20px"
      color="neutrals.400"
      backgroundColor="white"
      marginRight="4px"
      lineHeight="18px"
      width="18px"
      textAlign="center"
      fontSize="12px"
      {...props}
    >
      {children}
    </Box>
  )
}
