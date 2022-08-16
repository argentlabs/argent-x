import { isString } from "lodash-es"
import { FC, useMemo } from "react"
import { Navigate, useParams } from "react-router-dom"
import styled, { useTheme } from "styled-components"

import { Network } from "../../../shared/network"
import { Transaction, compareTransactions } from "../../../shared/transactions"
import { useAppState } from "../../app.state"
import { CopyTooltip } from "../../components/CopyTooltip"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../components/Fields"
import { ContentCopyIcon, OpenInNewIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { formatTruncatedAddress } from "../../services/addresses"
import { formatDateTime } from "../../services/dates"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { LoadingScreen } from "../actions/LoadingScreen"
import { useCurrentNetwork } from "../networks/useNetworks"
import { ExplorerTransactionDetail } from "./ExplorerTransactionDetail"
import { TransactionDetailWrapper } from "./TransactionDetailWrapper"
import { transformExplorerTransaction } from "./transform/transformExplorerTransaction"
import { useArgentExplorerTransaction } from "./useArgentExplorer"

function getErrorMessageFromErrorDump(errorDump?: string) {
  try {
    if (!isString(errorDump)) {
      return undefined
    }
    const errorCode = errorDump.match(/^Error message: (.+)$/im)
    return errorCode?.[1] ?? undefined
  } catch {
    return undefined
  }
}

const StyledContentCopyIcon = styled(ContentCopyIcon)`
  margin-left: 0.5em;
  cursor: pointer;
  font-size: 12px;
`

const TransactionFailedField = styled(Field)`
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

const TransactionLogMessage = styled(FieldValue)`
  line-break: anywhere;
  font-weight: 400;
  font-size: 14px;
  line-height: 15px;
`

const TransactionLogKey = styled(FieldKey)`
  display: flex;
  align-items: center;
  gap: 7px;
`

export const TransactionDetailScreen: FC = () => {
  const network = useCurrentNetwork()
  const { txHash } = useParams()
  const { data: explorerTransaction, isValidating } =
    useArgentExplorerTransaction(txHash)
  const account = useSelectedAccount()
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)

  const { transactions } = useAccountTransactions(account)

  const isLoading = isValidating && !explorerTransaction

  const transaction = useMemo(() => {
    if (!txHash) {
      return
    }
    return transactions.find((tx) =>
      compareTransactions(tx, {
        hash: txHash,
        account: {
          networkId: network.id,
        },
      }),
    )
  }, [network.id, transactions, txHash])

  const explorerTransactionTransformed = useMemo(() => {
    if (explorerTransaction && account) {
      if (!explorerTransaction.timestamp && transaction) {
        explorerTransaction.timestamp = transaction.timestamp
      }
      return transformExplorerTransaction({
        explorerTransaction,
        accountAddress: account.address,
        tokensByNetwork,
      })
    }
  }, [account, explorerTransaction, tokensByNetwork, transaction])

  if (!account) {
    return <Navigate to={routes.accounts()} />
  } else if (!txHash) {
    return <Navigate to={routes.accountTokens()} />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (explorerTransaction && explorerTransactionTransformed) {
    return (
      <ExplorerTransactionDetail
        explorerTransaction={explorerTransaction}
        explorerTransactionTransformed={explorerTransactionTransformed}
        network={network}
        tokensByNetwork={tokensByNetwork}
      />
    )
  }

  if (!transaction) {
    /** not possible via UI */
    return null
  }

  return <TransactionDetail transaction={transaction} network={network} />
}

interface ITransactionDetail {
  transaction: Transaction
  network: Network
}

export const TransactionDetail: FC<ITransactionDetail> = ({
  transaction,
  network,
}) => {
  const theme = useTheme()
  const isRejected = transaction.status === "REJECTED"

  const errorMessage =
    isRejected &&
    getErrorMessageFromErrorDump(transaction.failureReason?.error_message)

  const date = transaction.timestamp && new Date(transaction.timestamp * 1000)

  const dateLabel = formatDateTime(date)

  return (
    <TransactionDetailWrapper>
      <FieldGroup>
        <Field>
          <FieldKey>Status</FieldKey>
          <FieldValue>{isRejected ? "Failed" : "Complete"}</FieldValue>
        </Field>
        {errorMessage && (
          <Field>
            <FieldKey>Reason</FieldKey>
            <LeftPaddedField>{errorMessage}</LeftPaddedField>
          </Field>
        )}
        <Field>
          <FieldKey>Time</FieldKey>
          {dateLabel && <FieldValue>{dateLabel}</FieldValue>}
        </Field>
        <Field>
          <FieldKey>
            Hash
            <CopyTooltip message="Copied" copyValue={transaction.hash}>
              <StyledContentCopyIcon />
            </CopyTooltip>
          </FieldKey>
          {transaction.hash && (
            <FieldValue>{formatTruncatedAddress(transaction.hash)}</FieldValue>
          )}
        </Field>

        {/* TODO: Add this back when we have a way to fetch Network Fee from
           txHash */}

        {/* {!isRejected && (
            <TransactionField>
              <TransactionFieldKey>Network Fee</TransactionFieldKey>
              <TransactionFieldValue>0.0012 ETH</TransactionFieldValue>
            </TransactionField>
          )} */}
      </FieldGroup>

      {isRejected ? (
        <FieldGroup>
          <TransactionFailedField clickable>
            <TransactionLogKey>
              <div>Transaction log</div>
              <CopyTooltip
                message="Copied"
                copyValue={
                  transaction.failureReason?.error_message || transaction.hash
                }
              >
                <ContentCopyIcon style={{ fontSize: 12 }} />
              </CopyTooltip>
            </TransactionLogKey>
            <TransactionLogMessage style={{ color: theme.text2 }}>
              {transaction.failureReason?.error_message || "Unknown error"}
            </TransactionLogMessage>
          </TransactionFailedField>
        </FieldGroup>
      ) : (
        <FieldGroup>
          <Field
            clickable
            onClick={() => openVoyagerTransaction(transaction.hash, network)}
          >
            <FieldKey>View on Voyager</FieldKey>
            <FieldValue>
              <OpenInNewIcon />
            </FieldValue>
          </Field>
        </FieldGroup>
      )}
    </TransactionDetailWrapper>
  )
}
