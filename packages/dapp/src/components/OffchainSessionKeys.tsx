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
import { OffchainSessionKeysSign } from "./OffchainSessionKeysSign"
import { OffchainSessionKeysExecute } from "./OffchainSessionKeysExecute"

interface OffchainSessionKeysProps {
  account: AccountInterface
  setTransactionStatus: (status: Status) => void
  setLastTransactionHash: (tx: string) => void
  transactionStatus: Status
}

/* no starknet react, need to use the account directly to sign
  and the offchainSessionAccount to execute the transaction
  */
const OffchainSessionKeys: FC<OffchainSessionKeysProps> = ({
  account,
  setTransactionStatus,
  transactionStatus,
  setLastTransactionHash,
}) => {
  const [offchainSessionAccount, setOffchainSessionAccount] = useState<
    OffchainSessionAccount | undefined
  >()

  return (
    <Flex flex={1} width="full">
      <OffchainSessionKeysSign
        account={account}
        setTransactionStatus={setTransactionStatus}
        setOffchainSessionAccount={setOffchainSessionAccount}
      />
      <OffchainSessionKeysExecute
        account={account}
        setTransactionStatus={setTransactionStatus}
        setLastTransactionHash={setLastTransactionHash}
        transactionStatus={transactionStatus}
        offchainSessionAccount={offchainSessionAccount}
      />
    </Flex>
  )
}

export { OffchainSessionKeys }
