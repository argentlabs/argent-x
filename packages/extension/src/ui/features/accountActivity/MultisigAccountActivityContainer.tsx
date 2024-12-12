import { H3 } from "@argent/x-ui"
import { Center, Tab, TabList, Tabs } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import type { FC } from "react"
import { Suspense, useMemo } from "react"

import { PendingMultisigTransactions } from "./legacy/PendingMultisigTransactions"
import { useMultisigPendingOffchainSignaturesByAccount } from "../multisig/multisigOffchainSignatures.state"
import { useMultisigPendingTransactionsByAccount } from "../multisig/multisigTransactions.state"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { ActivityHistoryContainer } from "./ActivityHistoryContainer"
import { EmptyAccountActivity } from "./EmptyAccountActivity"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useActivityTabWithRestoreScrollState } from "./useActivityTabWithRestoreScrollState"

export interface MultisigAccountActivityContainerProps {
  account: WalletAccount
}

export const MultisigAccountActivityContainer: FC<
  MultisigAccountActivityContainerProps
> = ({ account }) => {
  const queueTabIndex = 0
  const historyTabIndex = 1

  const [tabIndex, setTabIndex] = useActivityTabWithRestoreScrollState(
    queueTabIndex,
    historyTabIndex,
  )

  const network = useCurrentNetwork()

  const pendingMultisigTransactions =
    useMultisigPendingTransactionsByAccount(account)

  const pendingMultisigOffchainSignatures =
    useMultisigPendingOffchainSignaturesByAccount(account)

  const sortedPendingTransactions = useMemo(() => {
    const sortedTx = pendingMultisigTransactions.sort(
      (a, b) => a.nonce - b.nonce,
    )
    const sortedSignatures = pendingMultisigOffchainSignatures.sort(
      (tx) => -tx.timestamp,
    )
    return [...sortedSignatures, ...sortedTx]
  }, [pendingMultisigOffchainSignatures, pendingMultisigTransactions])

  const header = useMemo(() => {
    return (
      <>
        <Center px={4} pt={2} pb={6}>
          <H3>Activity</H3>
        </Center>
        <Tabs index={tabIndex} onChange={setTabIndex} mb={4}>
          <TabList>
            <Tab>Queue</Tab>
            <Tab>History</Tab>
          </TabList>
        </Tabs>
      </>
    )
  }, [setTabIndex, tabIndex])

  if (tabIndex === 0) {
    return (
      <>
        {header}
        {isEmpty(sortedPendingTransactions) ? (
          <EmptyAccountActivity />
        ) : (
          <PendingMultisigTransactions
            pendingMultisigActions={sortedPendingTransactions}
            account={account}
            network={network}
            pt={0}
          />
        )}
      </>
    )
  }

  return (
    <Suspense fallback={header}>
      <ActivityHistoryContainer account={account} header={header} />
    </Suspense>
  )
}
