import { AnyActivity } from "@argent/x-shared/simulation"
import {
  ActivityRowSkeleton,
  VirtualizedActivityList,
  type VirtualizedActivityListItemWrapperProps,
} from "@argent/x-ui/simulation"
import { useAtom } from "jotai"
import { isEmpty } from "lodash-es"
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { VirtuosoHandle } from "react-virtuoso"

import { routes } from "../../../shared/ui/routes"
import { clientActivityCacheService } from "../../services/activity/cache"
import { onBlockExplorerOpenTransaction } from "../../services/blockExplorer.service"
import { activityForAccountView } from "../../views/activityCache"
import { useView } from "../../views/implementation/react"
import { Account } from "../accounts/Account"
import { EmptyAccountActivity } from "./EmptyAccountActivity"
import { virtuosoStateSnapshotAtom } from "./state"
import { Box, Skeleton } from "@chakra-ui/react"
import { CellStack, HeaderCell, formatDate } from "@argent/x-ui"
import { WalletAccount } from "../../../shared/wallet.model"

const openTxExplorerStatuses: Array<AnyActivity["status"]> = [
  "failure",
  "pending",
]

const RowWrapper: FC<VirtualizedActivityListItemWrapperProps> = ({
  index,
  ...rest
}) => <Box px={4} pb={2} {...rest} />

const SubTitleWrapper: FC<VirtualizedActivityListItemWrapperProps> = ({
  index,
  ...rest
}) => <Box px={4} pb={2} mt={index === 0 ? 0 : 4} {...rest} />

const footer = <Box h={3} />

export interface ActivityHistoryContainerProps {
  account: WalletAccount
  header?: ReactNode
}

export const ActivityHistoryContainer: FC<ActivityHistoryContainerProps> = ({
  account,
  header,
}) => {
  const didMakeInitialFetch = useRef(false)
  const [virtuosoStateSnapshot, setVirtuosoStateSnapshot] = useAtom(
    virtuosoStateSnapshotAtom,
  )
  const navigate = useNavigate()
  const activities = useView(activityForAccountView(account))
  const endReached = useCallback(() => {
    void clientActivityCacheService.loadMore(account)
  }, [account])
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  // restoreScrollState param allows a simple way to flag if state sould be restored when returning from detail screen
  const [query] = useSearchParams()
  const restoreScrollState = query.get("restoreScrollState")

  // don't restore state unless the flag is set
  const restoreStateFrom = useMemo(() => {
    if (restoreScrollState) {
      return virtuosoStateSnapshot
    }
    return undefined
  }, [restoreScrollState, virtuosoStateSnapshot])

  const onActivityClick = useCallback(
    (activity: AnyActivity) => {
      if (openTxExplorerStatuses.includes(activity.status)) {
        void onBlockExplorerOpenTransaction({
          hash: activity.transaction.hash,
          networkId: account.networkId,
        })
      } else {
        virtuosoRef.current?.getState((snapshot) => {
          setVirtuosoStateSnapshot(snapshot)
        })
        const returnTo = `${routes.accountActivity()}?restoreScrollState=true`
        navigate(routes.transactionDetail(activity.transaction.hash, returnTo))
      }
    },
    [account.networkId, navigate, setVirtuosoStateSnapshot],
  )

  // make initial fetch
  useEffect(() => {
    if (activities === undefined && !didMakeInitialFetch.current) {
      didMakeInitialFetch.current = true
      endReached()
    }
  }, [activities, endReached])

  // initial fetch
  if (activities === undefined) {
    return (
      <>
        {header}
        <CellStack py={0}>
          <Skeleton rounded="base" width="33.3%">
            <HeaderCell>{formatDate(Date.now())}</HeaderCell>
          </Skeleton>
          <ActivityRowSkeleton />
          <ActivityRowSkeleton />
          <ActivityRowSkeleton />
        </CellStack>
      </>
    )
  }

  // fetched, but empty
  if (isEmpty(activities)) {
    return (
      <>
        {header}
        <EmptyAccountActivity />
      </>
    )
  }

  return (
    <VirtualizedActivityList
      ref={virtuosoRef}
      activities={activities}
      networkId={account.networkId}
      header={header}
      footer={footer}
      endReached={endReached}
      onActivityClick={onActivityClick}
      restoreStateFrom={restoreStateFrom}
      RowWrapper={RowWrapper}
      SubTitleWrapper={SubTitleWrapper}
    />
  )
}
