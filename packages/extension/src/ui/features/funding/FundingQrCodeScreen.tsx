import { FC } from "react"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { PageWrapper } from "../../components/Page"
import { useSelectedAccount } from "../../states/account"
import {
  getAccountName,
  useAccountMetadata,
} from "../../states/accountMetadata"
import { formatFullAddress } from "../../utils/addresses"
import { QrCode } from "./QrCode"

const Container = styled.div`
  padding: 0 20px;
  text-align: center;
`

const AccountName = styled.h1`
  font-style: normal;
  font-weight: 700;
  font-size: 22px;
  line-height: 28px;
  margin: 32px 0 16px 0;
`

const AccountAddress = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  word-spacing: 5px;
  color: #8f8e8c;
`

export const FundingQrCodeScreen: FC = () => {
  const account = useSelectedAccount()
  const { accountNames } = useAccountMetadata()

  return (
    <>
      <IconBar back close />
      <PageWrapper>
        {account && (
          <Container>
            <QrCode size={220} data={account?.address} />
            <AccountName>{getAccountName(account, accountNames)}</AccountName>
            <AccountAddress>
              {formatFullAddress(account.address)}
            </AccountAddress>
          </Container>
        )}
      </PageWrapper>
    </>
  )
}
