import { H2 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { addNetwork } from "../services/wallet.service"
import { useState } from "react"

const AddNetwork = () => {
  const [addNetworkError, setAddNetworkError] = useState("")

  const handleAddNetwork = async () => {
    try {
      await addNetwork({
        id: "dapp-test",
        chainId: "SN_DAPP_TEST",
        chainName: "Test chain name",
        baseUrl: "http://localhost:5050",
        rpcUrls: ["http://localhost:5050/rpc"],
      })
      setAddNetworkError("")
    } catch (error) {
      setAddNetworkError((error as any).message)
    }
  }

  return (
    <Flex direction="column" gap="3" flex="1">
      <H2>Network</H2>
      <Flex
        as="button"
        color="#0097fc"
        fontWeight="bold"
        onClick={handleAddNetwork}
      >
        Add network to wallet
      </Flex>
      <span className="error-message">{addNetworkError}</span>
    </Flex>
  )
}

export { AddNetwork }
