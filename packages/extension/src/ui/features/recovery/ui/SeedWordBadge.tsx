import { Box } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const SeedWordBadge: FC<PropsWithChildren> = ({
  children,
  ...props
}) => {
  return (
    <Box
      padding="4px 12px 4px 4px"
      borderRadius="20px"
      fontWeight="600"
      fontSize="13px"
      lineHeight="18px"
      textAlign="center"
      backgroundColor="rgba(255, 255, 255, 0.1)"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      {...props}
    >
      {children}
    </Box>
  )
}
