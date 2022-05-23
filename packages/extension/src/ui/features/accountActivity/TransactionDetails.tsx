import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled, { css } from "styled-components"

import { useAppState } from "../../app.state"
import { CopyTooltip } from "../../components/CopyTooltip"
import { ChevronRight } from "../../components/Icons/ChevronRight"
import { CloseIcon } from "../../components/Icons/CloseIcon"
import { ContentCopyIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { formatDateTime } from "../../services/dates"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useNetwork } from "../networks/useNetworks"

const CloseIconWrapper = styled.div`
  cursor: pointer;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 9px 16px 0px;
  margin-bottom: 68px;
`

const Header = styled.h2`
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
  margin-bottom: 17.5px;
  text-align: left;
  padding-left: 8px;
`

const TransactionCard = styled.section`
  background: #333332;
  border: 1px solid #161616;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`

const TransactionField = styled.div<{ clickable?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;

  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
    `}
`

const Separator = styled.div`
  border-top: 1px solid #161616;
  margin: 0;
  padding: 0;
`

const TransactionFieldKey = styled.div`
  color: #8f8e8c;
`
const TransactionFieldValue = styled.div``

const TransactionFailedField = styled(TransactionField)`
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

const TransactionLogMessage = styled(TransactionFieldValue)`
  line-break: anywhere;
  font-weight: 400;
  font-size: 14px;
  line-height: 15px;
`

const TransactionLogKey = styled(TransactionFieldKey)`
  display: flex;
  align-items: center;
  gap: 7px;
`
export const TransactionDetail: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { network } = useNetwork(switcherNetworkId)
  const { txHash } = useParams()

  const account = useSelectedAccount()

  const { transactions } = useAccountTransactions(account?.address ?? "")

  const transaction = transactions.find((tx) => tx.hash === txHash)

  const isRejected = transaction?.status === "REJECTED"

  const date =
    transaction &&
    transaction.timestamp &&
    new Date(transaction.timestamp * 1000)

  const dateLabel = date && formatDateTime(date)

  return transaction ? (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "20px 18px",
        }}
      >
        <CloseIconWrapper onClick={() => navigate(routes.accountActivity())}>
          <CloseIcon />
        </CloseIconWrapper>
      </div>
      <Container>
        <Header>Transaction</Header>

        <TransactionCard>
          <TransactionField>
            <TransactionFieldKey>Status</TransactionFieldKey>
            <TransactionFieldValue>
              {isRejected ? "Failed" : "Complete"}
            </TransactionFieldValue>
          </TransactionField>
          <Separator />
          <TransactionField>
            <TransactionFieldKey>Time</TransactionFieldKey>
            <TransactionFieldValue>{dateLabel}</TransactionFieldValue>
          </TransactionField>
          <Separator />

          {/* TODO: Add this back when we have a way to fetch Network Fee from
           txHash */}

          {/* {!isRejected && (
            <TransactionField>
              <TransactionFieldKey>Network Fee</TransactionFieldKey>
              <TransactionFieldValue>0.0012 ETH</TransactionFieldValue>
            </TransactionField>
          )} */}
        </TransactionCard>

        {isRejected ? (
          <TransactionCard>
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
              <TransactionLogMessage style={{ color: "#8f8e8c" }}>
                {transaction.failureReason?.error_message}
              </TransactionLogMessage>
            </TransactionFailedField>
          </TransactionCard>
        ) : (
          <TransactionCard>
            <TransactionField
              clickable
              onClick={() => openVoyagerTransaction(transaction.hash, network)}
            >
              <TransactionFieldKey>View on Voyager</TransactionFieldKey>
              <TransactionFieldValue>
                <ChevronRight />
              </TransactionFieldValue>
            </TransactionField>
          </TransactionCard>
        )}
      </Container>
    </>
  ) : (
    <Header>Error</Header>
  )
}
