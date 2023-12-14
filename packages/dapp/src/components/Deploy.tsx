import { Button, H2, Input } from "@argent/ui"
import { UniversalDeployerContractPayload } from "starknet"

import { Flex } from "@chakra-ui/react"
import { FC, useState } from "react"
import { deploy } from "../services/wallet.service"
import { Status } from "../types/Status"

interface DeployProps {
  setTransactionStatus: (status: Status) => void
  setLastTransactionHash: (status: string) => void
}

const Deploy: FC<DeployProps> = ({
  setTransactionStatus,
  setLastTransactionHash,
}) => {
  const [deployClassHash, setDeployClassHash] = useState("")

  const handleDeploy = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (!deployClassHash) {
        throw new Error("No class hash")
      }
      const payload: UniversalDeployerContractPayload = {
        classHash: deployClassHash,
      }
      const result = await deploy(payload)
      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <Flex
      as="form"
      onSubmit={handleDeploy}
      direction="column"
      background="neutrals.700"
      flex={1}
      p="4"
      gap="3"
      borderTopRightRadius="lg"
      borderBottomRightRadius="lg"
    >
      <H2>Deploy</H2>

      <label htmlFor="deployClassHash">Class Hash to deploy:</label>
      <Input
        style={{ width: "100%" }}
        id="deployClassHash"
        name="deployClassHash"
        type="text"
        onChange={(e) => {
          setDeployClassHash(e.target.value)
        }}
        value={deployClassHash}
      />

      <Button type="submit" colorScheme="inverted">
        Deploy
      </Button>
    </Flex>
  )
}

export { Deploy }
