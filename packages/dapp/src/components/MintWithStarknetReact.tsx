import { bigDecimal } from "@argent/shared"
import { H2, Input } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { useContractWrite } from "@starknet-react/core"
import { FC, useMemo, useState } from "react"
import { AccountInterface } from "starknet"
import { ETHTokenAddress } from "../services/token.service"
import { Status } from "../types/Status"

interface MintProps {
  account?: AccountInterface
  setTransactionStatus: (status: Status) => void
  setLastTransactionHash: (status: string) => void
  transactionStatus: Status
}

const MintWithStarknetReact: FC<MintProps> = ({
  account,
  setTransactionStatus,
  setLastTransactionHash,
  transactionStatus,
}) => {
  const [mintAmount, setMintAmount] = useState("10")
  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus)

  const mintCalls = useMemo(() => {
    if (!account) {
      return []
    }
    return [
      {
        contractAddress: ETHTokenAddress,
        entrypoint: "transfer",
        calldata: [
          account?.address,
          Number(bigDecimal.parseEther(mintAmount).value),
          0,
        ],
      },
    ]
  }, [account, mintAmount])

  const { writeAsync: mintWithStarknetReact } = useContractWrite({
    calls: mintCalls,
  })

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setTransactionStatus("approve")
      const { transaction_hash } = await mintWithStarknetReact()
      setLastTransactionHash(transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <Flex flex={1} width="full" gap={10}>
      <Flex
        as="form"
        onSubmit={handleMintSubmit}
        direction="column"
        background="neutrals.700"
        flex={1}
        p="4"
        gap="3"
        borderRadius="lg"
      >
        <H2>Mint token</H2>
        <Input
          disabled
          placeholder="Amount"
          type="text"
          id="mint-amount"
          name="fname"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
        />

        <Input type="submit" disabled={true} value="Not possible with ETH!" />
      </Flex>
    </Flex>
  )
}

export { MintWithStarknetReact }
