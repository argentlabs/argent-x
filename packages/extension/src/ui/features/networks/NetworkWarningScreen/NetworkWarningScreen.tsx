import { NetworkSecondaryIcon } from "@argent/x-ui/icons"
import { H2, P2 } from "@argent/x-ui"
import { Button, Center, Circle, Text } from "@chakra-ui/react"
import type { FC } from "react"

type NetworkWarningScreenProps = {
  onClick?: () => void
}
export const NetworkWarningScreen: FC<NetworkWarningScreenProps> = ({
  onClick,
}) => {
  return (
    <Center flex={1} flexDirection={"column"} py={6} px={5}>
      <Center flex={1} flexDirection={"column"} textAlign={"center"}>
        <Circle
          backgroundColor={"surface-elevated"}
          size={24}
          position="relative"
        >
          <Text fontSize={"6xl"}>
            <NetworkSecondaryIcon />
          </Text>
          <Circle
            position={"absolute"}
            right={1}
            bottom={1}
            size={5}
            bg={"warning.500"}
            border={"4px"}
            borderColor="neutrals.900"
          />
        </Circle>
        <H2 pt={6} pb={3}>
          Network issues
        </H2>
        <P2 color="neutrals.100">
          Starknet is in Alpha and is experiencing degraded network performance.
          Your transactions may fail.
        </P2>
      </Center>
      <Button
        mt={6}
        width={["100%", "initial"]}
        colorScheme="primary"
        onClick={onClick}
      >
        I understand
      </Button>
    </Center>
  )
}
