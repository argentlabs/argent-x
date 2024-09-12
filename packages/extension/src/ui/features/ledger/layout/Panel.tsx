import { Box, BoxProps } from "@chakra-ui/react"

export const Panel = (props: BoxProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    width="100%"
    padding="0 56px"
    {...props}
  />
)
