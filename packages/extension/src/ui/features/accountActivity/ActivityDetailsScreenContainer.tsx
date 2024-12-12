import type { FC } from "react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { activityForTransactionHashView } from "../../views/activityCache"
import { ActivityDetailsScreen } from "./ActivityDetailsScreen"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { ActivityDetailsScreenEmpty } from "./ActivityDetailsScreenEmpty"
import { clientActivityCacheService } from "../../services/activity/cache"
import { routes } from "../../../shared/ui/routes"

export const ActivityDetailsScreenContainer: FC = () => {
  const didMakeInitialFetch = useRef(false)
  const account = useView(selectedAccountView)
  const onBack = useNavigateReturnToOrBack()
  const navigate = useNavigate()
  const { txHash } = useParams()
  const activity = useView(
    activityForTransactionHashView({ account, hash: txHash }),
  )

  // make initial fetch if activity is not in cache - TODO: this should fetch the single entity when backend supports it
  useEffect(() => {
    if (activity === undefined && !didMakeInitialFetch.current) {
      didMakeInitialFetch.current = true
      void clientActivityCacheService.loadMore(account)
    }
  }, [account, activity])

  const goToTransactionsConfirmations = useCallback(() => {
    if (!account || !activity) {
      return
    }
    navigate(
      routes.multisigTransactionConfirmations(
        account.id,
        activity.transaction.hash,
        "activity",
      ),
    )
  }, [account, activity, navigate])

  const multisigBannerProps = useMemo(() => {
    if (
      !account ||
      !activity ||
      account?.type !== "multisig" ||
      !activity?.multisigDetails?.signers?.length
    ) {
      return undefined
    }
    return {
      account,
      confirmations: activity.multisigDetails?.signers?.length,
      onClick: goToTransactionsConfirmations,
    }
  }, [account, activity, goToTransactionsConfirmations])

  if (!account || !activity) {
    return (
      <ActivityDetailsScreenEmpty
        txHash={txHash}
        networkId={account?.networkId}
      />
    )
  }

  return (
    <ActivityDetailsScreen
      activity={activity}
      networkId={account.networkId}
      multisigBannerProps={multisigBannerProps}
      onBack={onBack}
    />
  )
}
