import { Button, H2, Input } from "@argent/ui"
import { OffchainSessionAccount } from "@argent/x-sessions"
import { FC, useState } from "react"
import { Abi, AccountInterface, Contract } from "starknet"

import { Flex } from "@chakra-ui/react"
import Erc20Abi from "../../abi/ERC20.json"
import {
  ETHTokenAddress,
  parseInputAmountToUint256,
} from "../services/token.service"
import { Status } from "../types/Status"

interface OffchainSessionKeysExecuteProps {
  account: AccountInterface
  setTransactionStatus: (status: Status) => void
  setLastTransactionHash: (tx: string) => void
  transactionStatus: Status
  offchainSessionAccount: OffchainSessionAccount | undefined
}

const OffchainSessionKeysExecute: FC<OffchainSessionKeysExecuteProps> = ({
  account,
  setTransactionStatus,
  transactionStatus,
  setLastTransactionHash,
  offchainSessionAccount,
}) => {
  const [transferOffchainSessionAmount, setTransferOffchainSessionAmount] =
    useState("")

  const buttonsDisabled =
    ["approve", "pending"].includes(transactionStatus) ||
    !offchainSessionAccount

  const handleOffchainSessionTransaction = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setTransactionStatus("pending")
      if (!offchainSessionAccount) {
        throw new Error("No open session")
      }
      const erc20Contract = new Contract(
        Erc20Abi as Abi,
        ETHTokenAddress,
        offchainSessionAccount,
      )

      const result = await erc20Contract.transfer(
        account.address,
        parseInputAmountToUint256(transferOffchainSessionAmount),
      )

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("success")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <Flex
      as="form"
      direction="column"
      background="neutrals.700"
      onSubmit={handleOffchainSessionTransaction}
      flex={1}
      p="4"
      gap="3"
      borderTopRightRadius="lg"
      borderBottomRightRadius="lg"
    >
      <H2>Use session keys</H2>

      <Input
        type="text"
        id="transfer-amount"
        name="fname"
        placeholder="Amount"
        value={transferOffchainSessionAmount}
        isDisabled={!offchainSessionAccount}
        onChange={(e) => setTransferOffchainSessionAmount(e.target.value)}
      />
      <Button
        colorScheme="primary"
        type="submit"
        isDisabled={buttonsDisabled}
        maxW="350px"
      >
        Transfer with session keys
      </Button>
    </Flex>
  )
}

export { OffchainSessionKeysExecute }
