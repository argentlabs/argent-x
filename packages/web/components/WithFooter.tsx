import { L2 } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { PropsWithChildren } from "react"
import { FC } from "react"

export const WithFooter: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box as="main" display="flex" flexDirection="column" minHeight="100vh">
      <style>
        {`
            html,
            body {
              height: 100%;
              margin: 0;
              padding: 0;
            }
            `}
      </style>
      <Box as="main" flex="1">
        {children}
      </Box>
      <Box
        as="footer"
        p={6}
        px={8}
        borderTop="1px"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={6}
      >
        <L2 color="gray.600">
          Copyright © {new Date().getFullYear()} Argent Ltd. All rights reserved
        </L2>
        <Box display="inline-flex" alignItems="center" gap={4}>
          <L2 color="gray.600">Privacy</L2>
          <L2 color="gray.600">Terms</L2>
          <L2 color="gray.600">Help</L2>
        </Box>
      </Box>
    </Box>
  )
}
