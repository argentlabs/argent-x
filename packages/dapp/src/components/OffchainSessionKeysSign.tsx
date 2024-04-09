import { Button, H2, Input } from "@argent/x-ui"
import { OffchainSessionAccount } from "@argent/x-sessions"
import { FC, useState } from "react"
import { AccountInterface, RpcProvider } from "starknet"

import { Flex } from "@chakra-ui/react"
import { getStarkKey, utils } from "micro-starknet"
import { createSessionKeys } from "../services/wallet.service"
import { Status } from "../types/Status"

interface OffchainSessionKeysSignProps {
  account: AccountInterface
  setTransactionStatus: (status: Status) => void
  setOffchainSessionAccount: (account: OffchainSessionAccount) => void
}

const OffchainSessionKeysSign: FC<OffchainSessionKeysSignProps> = ({
  account,
  setTransactionStatus,
  setOffchainSessionAccount,
}) => {
  const [allowedFees, setAllowedFees] = useState("")
  const [sessionSigner] = useState(utils.randomPrivateKey())

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()

      setTransactionStatus("approve")
      const signedSession = await createSessionKeys(
        getStarkKey(sessionSigner),
        allowedFees,
        account,
      )

      const provider = new RpcProvider({
        nodeUrl: "https://cloud.argent-api.com/v1/starknet/goerli/rpc/v0.5",
      })

      const sessionAccount = new OffchainSessionAccount(
        provider,
        account.address,
        sessionSigner,
        signedSession,
        account,
      )

      setOffchainSessionAccount(sessionAccount)

      setTransactionStatus("success")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <Flex
      as="form"
      onSubmit={handleCreateSessionSubmit}
      direction="column"
      background="neutrals.700"
      flex={1}
      p="4"
      gap="3"
      borderTopLeftRadius="lg"
      borderBottomLeftRadius="lg"
    >
      <H2>Create session keys</H2>
      <Input
        type="text"
        id="set-allowed-amount-fees"
        name="fname"
        value={allowedFees}
        placeholder="Allowed fees"
        onChange={(e) => setAllowedFees(e.target.value)}
      />
      <Button colorScheme="primary" type="submit" maxW="350px">
        Create session keys
      </Button>
    </Flex>
  )
}

export { OffchainSessionKeysSign }
