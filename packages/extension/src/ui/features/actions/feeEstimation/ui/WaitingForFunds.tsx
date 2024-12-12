import { Center, Spinner, Text } from "@chakra-ui/react"
import type { FC, PropsWithChildren } from "react"

export const WaitingForFunds: FC<PropsWithChildren> = (props) => {
  return (
    <Center
      borderRadius="xl"
      backgroundColor="accent.500"
      p={3}
      gap={2}
      {...props}
    >
      <Spinner size={"sm"} />
      <Text color="white" fontSize="xs" fontWeight={600}>
        Waiting for funds...
      </Text>
    </Center>
  )
}
