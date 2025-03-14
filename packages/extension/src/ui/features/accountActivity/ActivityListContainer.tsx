import {
  NativeActivityTypeNative,
  type AnyActivity,
} from "@argent/x-shared/simulation"
import { CellStack, H5 } from "@argent/x-ui"
import {
  ActivityRowSkeleton,
  VirtualizedActivityList,
  type VirtualizedActivityListProps,
  type VirtualizedActivityListItemWrapperProps,
} from "@argent/x-ui/simulation"
import { Box, Skeleton } from "@chakra-ui/react"
import { useAtom } from "jotai"
import { isEmpty } from "lodash-es"
import type { FC, ReactNode } from "react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { VirtuosoHandle } from "react-virtuoso"

import { routes } from "../../../shared/ui/routes"
import { urlWithQuery } from "../../../shared/utils/url"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { clientActivityCacheService } from "../../services/activity/cache"
import { onBlockExplorerOpenTransaction } from "../../services/blockExplorer.service"
import { EmptyAccountActivity } from "./EmptyAccountActivity"
import { virtuosoStateSnapshotAtom } from "./state"

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

interface ActivityListContainerProps
  extends Omit<VirtualizedActivityListProps, "activities" | "networkId"> {
  activities?: AnyActivity[]
  account: WalletAccount
  header?: ReactNode
}

export const ActivityListContainer: FC<ActivityListContainerProps> = ({
  activities,
  account,
  header,
  ...rest
}) => {
  const didMakeInitialFetch = useRef(false)
  const [virtuosoStateSnapshot, setVirtuosoStateSnapshot] = useAtom(
    virtuosoStateSnapshotAtom,
  )
  const navigate = useNavigate()
  const endReached = useCallback(() => {
    void clientActivityCacheService.loadMore(account)
  }, [account])
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  // restoreScrollState param allows a simple way to flag if state sould be restored when returning from detail screen
  const [query] = useSearchParams()
  const restoreScrollState = query.get("restoreScrollState")
  const returnTo = useCurrentPathnameWithQuery()

  // don't restore state unless the flag is set
  const restoreStateFrom = useMemo(() => {
    if (restoreScrollState) {
      return virtuosoStateSnapshot
    }
    return undefined
  }, [restoreScrollState, virtuosoStateSnapshot])

  const onActivityClick = useCallback(
    (activity: AnyActivity) => {
      // the flag isExecuteFromOutside is used to identify the transaction intent, so there is no tx hash yet
      if (
        activity.type === NativeActivityTypeNative &&
        activity.meta?.isExecuteFromOutside
      ) {
        return
      }
      if (openTxExplorerStatuses.includes(activity.status)) {
        void onBlockExplorerOpenTransaction({
          hash: activity.transaction.hash,
          networkId: account.networkId,
        })
      } else {
        virtuosoRef.current?.getState((snapshot) => {
          setVirtuosoStateSnapshot(snapshot)
        })
        const transactionDetailReturnTo = urlWithQuery(returnTo, {
          restoreScrollState: "true",
        })
        navigate(
          routes.transactionDetail(
            activity.transaction.hash,
            transactionDetailReturnTo,
          ),
        )
      }
    },
    [account.networkId, navigate, returnTo, setVirtuosoStateSnapshot],
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
            <H5>&nbsp;</H5>
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
      {...rest}
    />
  )
}
