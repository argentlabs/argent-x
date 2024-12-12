import type { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"
import { isNotTransactionSimulationError } from "@argent/x-shared/simulation"
import {
  TransactionReviewActions,
  TransactionReviewSignAction,
  TransactionReviewSimulation,
} from "@argent/x-ui/simulation"
import type { FC, ReactNode } from "react"
import { useMemo } from "react"
import type { TypedData } from "@starknet-io/types-js"

import { ListSkeleton } from "../../../components/ScreenSkeleton"
import type { ConfirmScreenProps } from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConfirmScreen } from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { SessionKeyReview } from "./SessionKeyReview"
import { TransactionHeader } from "./header"
import { AccountDetailsNavigationBarContainer } from "../../navigation/AccountDetailsNavigationBarContainer"
import { SessionKeyHeader } from "./header/SessionKeyHeader"
import { isSessionKeyTypedData } from "../../../../shared/sessionKeys/schema"
import { useIsInfluenceDapp } from "../connectDapp/useIsInfluenceDapp"

interface SignActionScreenV2Props extends ConfirmScreenProps {
  dataToSign: TypedData
  actionIsApproving?: boolean
  footer?: ReactNode
  subtitle?: string
  dappLogoUrl?: string
  dappHost: string
  review?: EnrichedSimulateAndReview
  networkId: string
  error?: unknown
  isValidating?: boolean
}

export const SignActionScreenV2: FC<SignActionScreenV2Props> = ({
  dataToSign,
  actionIsApproving,
  title = "Review signature request",
  subtitle,
  dappHost,
  dappLogoUrl,
  review,
  networkId,
  isValidating = false,
  error,
  ...rest
}) => {
  const isInfluence = useIsInfluenceDapp(dappHost)

  const isSessionKey = isSessionKeyTypedData(dataToSign)

  const signatureReviewSimulation = useMemo(() => {
    if (!review) {
      return null
    }
    const txSimulations = review.transactions?.flatMap((transaction) =>
      isNotTransactionSimulationError(transaction)
        ? transaction.simulation
        : false,
    )
    // We only keep the last one as if there's more than one the first one is for the deployment of the account
    const lastSimulation = txSimulations?.[txSimulations.length - 1]
    if (!lastSimulation) {
      return null
    }

    return (
      <TransactionReviewSimulation
        simulation={lastSimulation}
        networkId={networkId}
      />
    )
  }, [review, networkId])
  const signatureReviewActions = useMemo(() => {
    return review?.transactions?.map((transaction, index) => {
      return (
        <TransactionReviewActions
          key={`review-${index}`}
          reviewOfTransaction={transaction.reviewOfTransaction}
          initiallyExpanded={false}
          networkId={networkId}
        />
      )
    })
  }, [networkId, review?.transactions])

  const navigationBar = <AccountDetailsNavigationBarContainer />

  const transactionHeader = isSessionKey ? null : (
    <TransactionHeader
      title={title}
      dappLogoUrl={dappLogoUrl}
      subtitle={subtitle}
      dappHost={dappHost}
      px={0}
    />
  )

  const header = isSessionKey ? (
    <SessionKeyHeader
      title="Start a session"
      dappLogoUrl={dappLogoUrl}
      subtitle={subtitle}
      dappHost={dappHost}
      isInfluence={isInfluence}
    />
  ) : null

  const confirmButtonText = isSessionKey ? "Start session" : "Sign"

  return (
    <ConfirmScreen
      confirmButtonText={confirmButtonText}
      confirmButtonLoadingText={confirmButtonText}
      confirmButtonDisabled={actionIsApproving}
      confirmButtonIsLoading={actionIsApproving}
      navigationBar={navigationBar}
      header={header}
      {...rest}
    >
      {transactionHeader}
      {isValidating ? (
        <ListSkeleton px={0} />
      ) : review && !error ? (
        <>
          {signatureReviewSimulation}
          {signatureReviewActions}
        </>
      ) : isSessionKey ? (
        <SessionKeyReview dataToSign={dataToSign} networkId={networkId} />
      ) : (
        <TransactionReviewSignAction dataToSign={dataToSign} />
      )}
    </ConfirmScreen>
  )
}
