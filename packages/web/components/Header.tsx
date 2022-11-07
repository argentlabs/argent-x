import { L2, logos } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { FC } from "react"

const { ArgentLogo } = logos

export const Header: FC = () => {
  return (
    <Box
      as="header"
      display="flex"
      p={4}
      px={5}
      alignItems="center"
      gap={2}
      borderBottom="1px"
      borderColor="gray.200"
    >
      <ArgentLogo />
      <L2 color="gray.600">Connect with Argent</L2>
    </Box>
  )
}
