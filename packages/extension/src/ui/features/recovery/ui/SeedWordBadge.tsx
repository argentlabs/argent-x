import { Box } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const SeedWordBadge: FC<PropsWithChildren> = ({
  children,
  ...props
}) => {
  return (
    <Box
      padding="4px 12px 4px 4px"
      py={2}
      borderRadius="8px"
      fontWeight="600"
      fontSize="13px"
      lineHeight="18px"
      textAlign="center"
      backgroundColor="neutrals.800"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      {...props}
    >
      {children}
    </Box>
  )
}
