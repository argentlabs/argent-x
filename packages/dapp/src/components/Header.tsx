import { Divider, Flex, Text } from "@chakra-ui/react"
import { Button } from "@argent/x-ui"
import { useRouter } from "next/router"
import Link from "next/link"
import { FC } from "react"

export const Header: FC<{
  isConnected?: boolean
  disconnectFn?: () => void
}> = ({ isConnected, disconnectFn }) => {
  const { pathname } = useRouter()

  return (
    <Flex direction="column" gap="3" mb="3">
      <Flex gap="12" alignItems="center">
        <Text fontWeight={pathname === "/" ? "bold" : ""}>
          <Link href="/">StarknetKit app</Link>
        </Text>
        <Text fontWeight={pathname === "/starknetReactDapp" ? "bold" : ""}>
          <Link href="/starknetReactDapp">Starknet React app</Link>
        </Text>
        <Flex flex={1} />

        {!isConnected && (
          <Button colorScheme="neutrals" onClick={() => localStorage.clear()}>
            Clear local storage
          </Button>
        )}
        {isConnected && disconnectFn && (
          <Button colorScheme="inverted" onClick={disconnectFn}>
            Disconnect
          </Button>
        )}
      </Flex>
      <Divider />
    </Flex>
  )
}
