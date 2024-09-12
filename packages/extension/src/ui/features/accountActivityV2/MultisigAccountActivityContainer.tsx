import { H4 } from "@argent/x-ui"
import { Center, Tab, TabList, Tabs } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC, Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { PendingMultisigTransactions } from "../accountActivity/PendingMultisigTransactions"
import { useMultisigPendingOffchainSignaturesByAccount } from "../multisig/multisigOffchainSignatures.state"
import { useMultisigPendingTransactionsByAccount } from "../multisig/multisigTransactions.state"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { ActivityHistoryContainer } from "./ActivityHistoryContainer"
import { EmptyAccountActivity } from "./EmptyAccountActivity"
import { WalletAccount } from "../../../shared/wallet.model"

export interface MultisigAccountActivityContainerProps {
  account: WalletAccount
}

export const MultisigAccountActivityContainer: FC<
  MultisigAccountActivityContainerProps
> = ({ account }) => {
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

  const [query, setQuery] = useSearchParams()
  const restoreScrollState = query.get("restoreScrollState")
  const [tabIndex, setTabIndex] = useState(restoreScrollState ? 1 : 0)
  useEffect(() => {
    /** when user clicks from History to Queue, no longer restore scroll state */
    if (tabIndex === 0 && restoreScrollState) {
      setQuery()
    }
  }, [restoreScrollState, setQuery, tabIndex])

  const header = useMemo(() => {
    return (
      <>
        <Center px={4} pt={2} pb={6}>
          <H4>Activity</H4>
        </Center>
        <Tabs index={tabIndex} onChange={setTabIndex} px={4} pb={4}>
          <TabList>
            <Tab>Queue</Tab>
            <Tab>History</Tab>
          </TabList>
        </Tabs>
      </>
    )
  }, [tabIndex])

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
