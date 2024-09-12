import { CellStack, iconsDeprecated } from "@argent/x-ui"
import {
  Box,
  Center,
  Divider,
  Flex,
  FlexProps,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { memoize } from "lodash-es"
import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { createNativeActivity } from "@argent/x-shared/simulation"
import { ActivityRow } from "@argent/x-ui/simulation"
import { num } from "starknet"
import { transformTransaction } from "../../../shared/activity/utils/transform"
import { buildBasicActivitySummary } from "../../../shared/activity/utils/transform/activity/buildActivitySummary"
import { getTransactionFromPendingMultisigTransaction } from "../../../shared/activity/utils/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { MultisigPendingOffchainSignature } from "../../../shared/multisig/pendingOffchainSignaturesStore"
import { MultisigPendingTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import { Network } from "../../../shared/network"
import {
  getNativeActivityStatusForTransaction,
  getNativeActivitySubtitleForTransaction,
} from "../../../shared/transactions/utils"
import { routes } from "../../../shared/ui/routes"
import { Multisig } from "../multisig/Multisig"
import { multisigView } from "../multisig/multisig.state"
import { OffchainSignatureListItem } from "./OffchainSignatureListItem"
import { WalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import { isMultisigTransactionRejectedAndNonceNotConsumed } from "../../../shared/multisig/utils/getMultisigTransactionType"

const { MultisigIcon, InfoIcon } = iconsDeprecated

interface PendingMultisigActionsProps extends FlexProps {
  pendingMultisigActions: (
    | MultisigPendingTransaction
    | MultisigPendingOffchainSignature
  )[]
  account: WalletAccount
  network: Network
}

export const isOffchainSignatureAction = (
  pendingMultisigAction:
    | MultisigPendingTransaction
    | MultisigPendingOffchainSignature,
): pendingMultisigAction is MultisigPendingOffchainSignature => {
  return "messageHash" in pendingMultisigAction
}

export const PendingMultisigTransactions: FC<PendingMultisigActionsProps> = ({
  pendingMultisigActions,
  account,
  network,
  ...rest
}) => {
  const multisig = useView(multisigView(account))
  if (!multisig) {
    return null
  }
  if (!pendingMultisigActions.length) {
    return null
  }

  return (
    <CellStack {...rest}>
      <PendingMultisigActionsContainer
        pendingMultisigActions={pendingMultisigActions}
        multisig={multisig}
        account={account}
        network={network}
      />
    </CellStack>
  )
}

interface PendingMultisigActionsContainerProps
  extends PendingMultisigActionsProps {
  multisig: Multisig
}

export const PendingMultisigActionsContainer: FC<
  PendingMultisigActionsContainerProps
> = ({ pendingMultisigActions, account, multisig, network }) => {
  const navigate = useNavigate()

  const getConfirmationSubtext = memoize((approvedSigners: string[]) => {
    return `${approvedSigners.length} out of ${multisig.threshold}`
  })

  const onClick = (
    action: MultisigPendingTransaction | MultisigPendingOffchainSignature,
  ) => {
    return isOffchainSignatureAction(action)
      ? navigate(
          routes.multisigPendingOffchainSignatureDetails(
            account.address,
            action.requestId,
          ),
        )
      : navigate(
          routes.multisigPendingTransactionDetails(
            account.address,
            action.requestId,
          ),
        )
  }

  /** this is for backwards compatibility, before multisig queing, to support existing multiple pending transactions with the same nonce
   *  this can be removed once all accounts have upgraded to 5.17.0 and replace it with the index
   */
  const orderedQueuePositions = useMemo(() => {
    let currentQueuePosition = 0
    let lastNonce: number

    return pendingMultisigActions.map((item) => {
      if (isOffchainSignatureAction(item)) {
        return
      } else {
        if (item.nonce !== lastNonce) {
          lastNonce = item.nonce
          return ++currentQueuePosition
        }
        return currentQueuePosition
      }
    })
  }, [pendingMultisigActions])

  return (
    <>
      {pendingMultisigActions.map((pendingTransaction, index) => {
        const requiresSelfAction = pendingTransaction.nonApprovedSigners.some(
          (signer: string) =>
            num.toBigInt(signer) === num.toBigInt(multisig.publicKey),
        )
        if (isOffchainSignatureAction(pendingTransaction)) {
          const additionalInfo = (
            <MultisigPendingTransactionsFooter
              getConfirmationSubtext={getConfirmationSubtext(
                pendingTransaction.approvedSigners,
              )}
              requiresSelfAction={requiresSelfAction}
              isApprovedByEnoughSigners={
                pendingTransaction.approvedSigners.length >= multisig.threshold
              }
            />
          )

          return (
            <OffchainSignatureListItem
              key={pendingTransaction.requestId}
              onClick={() => onClick(pendingTransaction)}
              pendingOffchainSignature={pendingTransaction}
              additionalInfo={additionalInfo}
            />
          )
        } else {
          const transaction = getTransactionFromPendingMultisigTransaction(
            pendingTransaction,
            account,
          )

          const transactionTransformed = transformTransaction({
            transaction,
            accountAddress: account.address,
          })

          if (transactionTransformed) {
            const status = getNativeActivityStatusForTransaction(transaction)
            const submitted = transaction.timestamp * 1000
            const lastModified = submitted
            const subtitle =
              pendingTransaction.meta?.subtitle ||
              getNativeActivitySubtitleForTransaction(transactionTransformed)
            const icon = pendingTransaction.meta?.icon
            const title =
              transactionTransformed.displayName ||
              pendingTransaction.meta?.title

            const nativeActivity = createNativeActivity({
              simulateAndReview: pendingTransaction.meta?.transactionReview,
              meta: {
                title,
                subtitle,
                icon,
              },
              transaction,
              status,
              submitted,
              lastModified,
            })

            if (!nativeActivity.transferSummary) {
              const activitySummary = buildBasicActivitySummary(
                transactionTransformed,
              )
              nativeActivity.transferSummary = activitySummary
            }

            const txNeedsRetry =
              isMultisigTransactionRejectedAndNonceNotConsumed(
                pendingTransaction.state,
              )
            const additionalInfo = (
              <MultisigPendingTransactionsFooter
                getConfirmationSubtext={getConfirmationSubtext(
                  pendingTransaction.approvedSigners,
                )}
                requiresSelfAction={requiresSelfAction}
                index={orderedQueuePositions[index]}
                isApprovedByEnoughSigners={
                  pendingTransaction.approvedSigners.length >=
                  multisig.threshold
                }
                txNeedsRetry={txNeedsRetry}
              />
            )
            return (
              <ActivityRow
                key={transaction.hash}
                onClick={() => onClick(pendingTransaction)}
                activity={nativeActivity}
                networkId={network.id}
                additionalInfo={additionalInfo}
              />
            )
          }
          return null
        }
      })}
    </>
  )
}

interface MultisigPendingTransactionsFooterProps {
  getConfirmationSubtext: string
  requiresSelfAction: boolean
  index?: number
  isApprovedByEnoughSigners?: boolean
  txNeedsRetry?: boolean
}

const MultisigPendingTransactionsFooter: FC<
  MultisigPendingTransactionsFooterProps
> = ({
  getConfirmationSubtext,
  requiresSelfAction,
  index,
  isApprovedByEnoughSigners,
  txNeedsRetry,
}) => {
  const TxStateDescription = () => {
    if (txNeedsRetry) {
      return (
        <Flex
          color="accent-red"
          _hover={{
            cursor: "default",
          }}
        >
          Transaction failed{" "}
          <Tooltip
            label={
              "This transaction failed with a validation error. Please retry or reject it"
            }
            width={54}
            padding={3}
          >
            <Box
              marginLeft={1}
              _hover={{
                cursor: "pointer",
              }}
            >
              <InfoIcon />
            </Box>
          </Tooltip>
        </Flex>
      )
    } else if (requiresSelfAction) {
      return "Needs your confirmation"
    } else if (isApprovedByEnoughSigners) {
      return (
        <Flex
          color={"accent-green"}
          _hover={{
            cursor: "default",
          }}
        >
          Awaiting execution{" "}
          <Tooltip
            label={
              "This transaction will only execute once the transactions in front have been confirmed"
            }
            width={54}
            padding={3}
          >
            <Box
              marginLeft={1}
              _hover={{
                cursor: "pointer",
              }}
            >
              <InfoIcon />
            </Box>
          </Tooltip>
        </Flex>
      )
    }
    return "Awaiting confirmations"
  }

  return (
    <>
      <Center height={"full"}>
        {index && (
          <>
            <Text color="text-secondary-web">#{index}</Text>
            <Divider
              color="black"
              orientation="vertical"
              mx={2}
              height={"130%"}
            />{" "}
          </>
        )}
        <MultisigIcon />
        <Text ml={1}>{getConfirmationSubtext}</Text>
      </Center>
      <Text
        color="accent-yellow"
        _hover={{
          cursor: "pointer",
        }}
      >
        <TxStateDescription />
      </Text>
    </>
  )
}
