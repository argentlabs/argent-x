import { FC } from "react"
import styled from "styled-components"

import { AccountAddress, AccountName } from "../../components/Address"
import { IconBar } from "../../components/IconBar"
import { PageWrapper } from "../../components/Page"
import { formatFullAddress } from "../../services/addresses"
import { usePageTracking } from "../../services/analytics"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useSelectedAccount } from "../accounts/accounts.state"
import { QrCode } from "./QrCode"

const Container = styled.div`
  padding: 0 20px;
  text-align: center;
`

export const FundingQrCodeScreen: FC = () => {
  const account = useSelectedAccount()
  usePageTracking("addFundsFromOtherAccount", {
    networkId: account?.networkId || "unknown",
  })
  const { accountNames } = useAccountMetadata()

  return (
    <>
      <IconBar back close />
      <PageWrapper>
        {account && (
          <Container>
            <QrCode size={220} data={account?.address} />
            <AccountName>{getAccountName(account, accountNames)}</AccountName>
            <AccountAddress aria-label="Full account address">
              {formatFullAddress(account.address)}
            </AccountAddress>
          </Container>
        )}
      </PageWrapper>
    </>
  )
}
