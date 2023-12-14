import { Button, H2 } from "@argent/ui"
import { truncateAddress } from "../services/address.service"
import { DAITokenAddress, ETHTokenAddress } from "../services/token.service"
import { addToken } from "../services/wallet.service"
import { useState } from "react"
import { Code, Flex } from "@chakra-ui/react"

const AddToken = () => {
  const [addTokenError, setAddTokenError] = useState("")

  const handleAddEth = async () => {
    try {
      await addToken(ETHTokenAddress)
      setAddTokenError("")
    } catch (error) {
      setAddTokenError((error as any).message)
    }
  }

  const handleAddDai = async () => {
    try {
      await addToken(DAITokenAddress)
      setAddTokenError("")
    } catch (error) {
      setAddTokenError((error as any).message)
    }
  }

  return (
    <Flex direction="column" gap="3" flex="1">
      <H2>ERC20</H2>
      ETH token address
      <Code
        backgroundColor="#0097fc4f"
        borderRadius="8px"
        p="0 0.5rem"
        width="fit-content"
      >
        <a
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#0097fc",
            display: "inline-block",
            textDecoration: "none",
          }}
        >
          {truncateAddress(ETHTokenAddress)}
        </a>
      </Code>
      <Flex
        as="button"
        color="#0097fc"
        fontWeight="bold"
        onClick={handleAddEth}
      >
        Add ETH token to wallet
      </Flex>
      <Flex
        as="button"
        color="#0097fc"
        fontWeight="bold"
        onClick={handleAddDai}
      >
        Add DAI token to wallet
      </Flex>
      <span className="error-message">{addTokenError}</span>
    </Flex>
  )
}

export { AddToken }
