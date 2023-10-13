import { HeaderCell, L2, icons } from "@argent/ui"
import { Center, Flex } from "@chakra-ui/react"
import { memoize, partition } from "lodash-es"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { MultisigPendingTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import { Network } from "../../../shared/network"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { Multisig } from "../multisig/Multisig"
import { useMultisig } from "../multisig/multisig.state"
import { TransactionListItem } from "./TransactionListItem"
import { transformTransaction } from "./transform"
import { getTransactionFromPendingMultisigTransaction } from "./transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { num } from "starknet"

const { MultisigIcon } = icons
interface PendingTransactionsProps {
  pendingTransactions: MultisigPendingTransaction[]
  account: Account
  network: Network
}

export const PendingMultisigTransactions: FC<PendingTransactionsProps> = ({
  pendingTransactions,
  account,
  network,
}) => {
  const multisig = useMultisig(account)
  if (!multisig) {
    return null
  }
  if (!pendingTransactions.length) {
    return null
  }

  const [selfPendingTxns, othersPendingTxns] = partition(
    pendingTransactions,
    (pendingTransaction) =>
      pendingTransaction.nonApprovedSigners.some(
        (signer) => num.toBigInt(signer) === num.toBigInt(multisig.publicKey),
      ),
  )

  return (
    <>
      {othersPendingTxns.length > 0 && (
        <>
          <HeaderCell>
            <Flex alignItems={"center"} gap={1}>
              Waiting for others to confirm
            </Flex>
          </HeaderCell>
          <PendingMultisigTransactionContainer
            pendingTransactions={othersPendingTxns}
            multisig={multisig}
            account={account}
            network={network}
          />
        </>
      )}
      {selfPendingTxns.length > 0 && (
        <>
          <HeaderCell>
            <Flex alignItems={"center"} gap={1}>
              Awaiting review
              <Center
                color={"neutrals.900"}
                backgroundColor={"skyBlue.500"}
                rounded={"full"}
                height={4}
                minWidth={4}
                fontWeight={"extrabold"}
                fontSize={"2xs"}
                px={0.5}
              >
                {selfPendingTxns.length}
              </Center>
            </Flex>
          </HeaderCell>
          <PendingMultisigTransactionContainer
            pendingTransactions={selfPendingTxns}
            multisig={multisig}
            account={account}
            network={network}
          />
        </>
      )}
    </>
  )
}

interface PendingMultisigTransactionContainerProps
  extends PendingTransactionsProps {
  multisig: Multisig
}

export const PendingMultisigTransactionContainer: FC<
  PendingMultisigTransactionContainerProps
> = ({ pendingTransactions, account, multisig, network }) => {
  const navigate = useNavigate()

  const getConfirmationSubtext = memoize((approvedSigners: string[]) => {
    return `${approvedSigners.length} confirmation${
      approvedSigners.length === 1 ? "" : "s"
    } • ${
      multisig.threshold - approvedSigners.length > 0
        ? multisig.threshold - approvedSigners.length
        : 0
    } remaining `
  })
  return (
    <>
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
            <Flex key={pendingTransaction.requestId} flexDirection="column">
              <TransactionListItem
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
                  {getConfirmationSubtext(pendingTransaction.approvedSigners)}
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
