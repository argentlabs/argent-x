import { ArgentXLogo } from "@argent/x-ui/logos-deprecated"
import type { BoxProps } from "@chakra-ui/react"
import { Box } from "@chakra-ui/react"

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

export const SidePanel = () => {
  return (
    <Box
      width={{ md: "31.25%" }}
      display={{ md: "flex" }}
      backgroundColor={{ md: "black" }}
      height={{ md: "100%" }}
      background={`url('./assets/onboarding-background.jpg') no-repeat center`}
      backgroundSize="cover"
    >
      <Panel>
        <ArgentXLogo w={20} h={20} />
      </Panel>
    </Box>
  )
}
