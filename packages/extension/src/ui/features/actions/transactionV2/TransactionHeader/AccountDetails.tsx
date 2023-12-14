import { Flex } from "@chakra-ui/react"
import { selectedAccountView } from "../../../../views/account"
import { useView } from "../../../../views/implementation/react"
import { B3, L2 } from "@argent/ui"
import { useCurrentNetwork } from "../../../networks/hooks/useCurrentNetwork"
import { formatAddress } from "@argent/shared"

export const AccountDetails = () => {
  const currentAccount = useView(selectedAccountView)
  const currentNetwork = useCurrentNetwork()
  return (
    <Flex justifyContent="space-between" px={4} py={5}>
      <Flex gap={1} alignItems={"baseline"}>
        <B3 color="text.primary">{currentAccount?.name}</B3>
        {currentAccount?.address && (
          <L2 color="text.secondary">
            ({formatAddress(currentAccount.address)})
          </L2>
        )}
      </Flex>
      <B3 color="text.primary">{currentNetwork.name}</B3>
    </Flex>
  )
}
