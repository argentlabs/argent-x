import { HeaderCell, L2, icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { memoize } from "lodash-es"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Network } from "../../../shared/network"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { useMultisigInfo } from "../multisig/hooks/useMultisigInfo"
import { EnrichedMultisigPendingTransaction } from "../multisig/multisigTransactions.state"
import { TransactionListItem } from "./TransactionListItem"
import { transformTransaction } from "./transform"
import { getTransactionFromPendingMultisigTransaction } from "./transform/transaction/transformers/pendingMultisigTransactionAdapter"

const { MultisigIcon } = icons
interface PendingTransactionsProps {
  pendingTransactions: EnrichedMultisigPendingTransaction[]
  account: Account
  network: Network
}

export const PendingMultisigTransactions: FC<PendingTransactionsProps> = ({
  pendingTransactions,
  account,
  network,
}) => {
  const { multisig } = useMultisigInfo(account)
  const navigate = useNavigate()
  if (!multisig) {
    return null
  }
  if (!pendingTransactions.length) {
    return null
  }
  const getConfirmationSubtext = memoize((approvedSigners: string[]) => {
    return `${approvedSigners.length} confirmation${
      approvedSigners.length === 1 ? "" : "s"
    } • ${multisig.threshold - approvedSigners.length} remaining `
  })
  return (
    <>
      <HeaderCell>
        <Flex alignItems={"center"} gap={1}>
          Waiting for others to confirm
        </Flex>
      </HeaderCell>
      {pendingTransactions.map((pendingTransaction) => {
        const transaction = getTransactionFromPendingMultisigTransaction(
          pendingTransaction,
          account,
        )
        const transactionTransformed = transformTransaction({
          transaction,
          accountAddress: account.address,
        })
        if (transactionTransformed) {
          const { hash } = transaction
          const onClick = () => {
            navigate(
              routes.multisigPendingTransactionDetails(
                account.address,
                pendingTransaction.requestId,
              ),
            )
          }
          return (
            <Flex key={hash} flexDirection="column">
              <TransactionListItem
                key={hash}
                txHash={hash}
                transactionTransformed={transactionTransformed}
                network={network}
                onClick={onClick}
                borderBottomRadius={0}
              />
              <Flex
                justifyContent="space-between"
                px={4}
                py={1}
                backgroundColor="neutrals.800"
                borderBottomRadius="xl"
                borderTop="1px solid black"
                _hover={{
                  cursor: "pointer",
                }}
                onClick={onClick}
              >
                <Flex alignItems="center">
                  <MultisigIcon mr={1} />
                  {getConfirmationSubtext(
                    pendingTransaction.data.content.approvedSigners,
                  )}
                </Flex>
                <L2
                  color="neutrals.500"
                  _hover={{
                    cursor: "pointer",
                  }}
                >
                  Click to review
                </L2>
              </Flex>
            </Flex>
          )
        }
        return null
      })}
    </>
  )
}
