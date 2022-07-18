import { isString } from "lodash-es"
import { FC } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled, { useTheme } from "styled-components"

import { compareTransactions } from "../../../shared/transactions"
import { CopyTooltip } from "../../components/CopyTooltip"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { CloseIcon } from "../../components/Icons/CloseIcon"
import { ContentCopyIcon, OpenInNewIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { formatTruncatedAddress } from "../../services/addresses"
import { formatDateTime } from "../../services/dates"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCurrentNetwork } from "../networks/useNetworks"

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

const HeadContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px 18px;
`

const CloseIconWrapper = styled.div`
  cursor: pointer;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px 0px;
  margin-bottom: 24px;
`

const StyledContentCopyIcon = styled(ContentCopyIcon)`
  margin-left: 0.5em;
  cursor: pointer;
  font-size: 12px;
`

const Title = styled.h2`
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
  margin-bottom: 17.5px;
  text-align: left;
  padding-left: 8px;
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
export const TransactionDetail: FC = () => {
  const navigate = useNavigate()
  const network = useCurrentNetwork()
  const { txHash } = useParams()

  const account = useSelectedAccount()

  const theme = useTheme()
  const { transactions } = useAccountTransactions(account)

  if (!account) {
    return <Navigate to={routes.accounts()} />
  } else if (!txHash) {
    return <Navigate to={routes.accountTokens()} />
  }

  const transaction = transactions.find((tx) =>
    compareTransactions(tx, {
      hash: txHash,
      account: {
        networkId: network.id,
      },
    }),
  )

  if (!transaction) {
    return <Navigate to={routes.accountTokens()} />
  }

  const isRejected = transaction.status === "REJECTED"

  const errorMessage =
    isRejected &&
    getErrorMessageFromErrorDump(transaction.failureReason?.error_message)

  const date = transaction.timestamp && new Date(transaction.timestamp * 1000)

  const dateLabel = formatDateTime(date)

  return (
    <>
      <HeadContainer>
        <CloseIconWrapper onClick={() => navigate(routes.accountActivity())}>
          <CloseIcon />
        </CloseIconWrapper>
      </HeadContainer>
      <Container>
        <Title>Transaction</Title>

        <FieldGroup>
          <Field>
            <FieldKey>Status</FieldKey>
            <FieldValue>{isRejected ? "Failed" : "Complete"}</FieldValue>
          </Field>
          {errorMessage && (
            <Field>
              <FieldKey>Reason</FieldKey>
              <FieldValue>{errorMessage}</FieldValue>
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
              <FieldValue>
                {formatTruncatedAddress(transaction.hash)}
              </FieldValue>
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
      </Container>
    </>
  )
}
