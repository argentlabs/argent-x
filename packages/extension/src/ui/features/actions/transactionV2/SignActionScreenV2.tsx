import {
  EnrichedSimulateAndReview,
  isNotTransactionSimulationError,
} from "@argent/x-shared/simulation"
import {
  TransactionReviewActions,
  TransactionReviewSignAction,
  TransactionReviewSimulation,
} from "@argent/x-ui/simulation"
import { Divider } from "@chakra-ui/react"
import { FC, ReactNode, useMemo } from "react"
import { TypedData } from "@starknet-io/types-js"

import { ListSkeleton } from "../../../components/ScreenSkeleton"
import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { SessionKeyReview } from "./SessionKeyReview"
import { TransactionHeader } from "./header"
import { NavigationBarAccountDetailsContainer } from "./header/NavigationBarAccountDetailsContainer"
import { SessionKeyHeader } from "./header/SessionKeyHeader"
import { isSessionKeyTypedData } from "../../../../shared/sessionKeys/schema"

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
  const isSessionKey = isSessionKeyTypedData(dataToSign)

  const signatureReviewSimulation = useMemo(() => {
    if (!review) {
      return null
    }
    const txSimulations = review.transactions.flatMap((transaction) =>
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
    return review?.transactions.map((transaction, index) => {
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

  const navigationBar = (
    <>
      <NavigationBarAccountDetailsContainer />
      <Divider color="neutrals.700" />
    </>
  )

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
