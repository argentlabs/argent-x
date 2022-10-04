import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import styled, { css } from "styled-components"

import { Header } from "../../components/Header"
import {
  AccountBalanceWalletIcon,
  FormatListBulletedIcon,
  PhotoLibraryIcon,
} from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { AccountFooter, FooterTab, FooterTabBadge } from "./AccountFooter"
import { AccountHeader } from "./AccountHeader"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { getAccountImageUrl } from "./accounts.service"
import { useSelectedAccount } from "./accounts.state"
import { useAccountTransactions } from "./accountTransactions.state"
import { ProfilePicture } from "./ProfilePicture"

export const Container = styled.div<{
  header?: boolean
  footer?: boolean
}>`
  ${({ header = false }) =>
    header &&
    css`
      padding-top: 68px;
    `}
  ${({ footer = false }) =>
    footer &&
    css`
      padding-bottom: 64px;
    `}

  ${Header} > a {
    width: 36px;
    height: 36px;
  }
`

interface AccountScreenContentProps {
  children?: ReactNode
}

export const AccountContainer: FC<AccountScreenContentProps> = ({
  children,
}) => {
  const { accountNames } = useAccountMetadata()
  const account = useSelectedAccount()
  const { pendingTransactions } = useAccountTransactions(account)
  const hasPendingTransactions = !!pendingTransactions.length

  if (!account) {
    return <></>
  }
  const accountName = getAccountName(account, accountNames)

  return (
    <Container header footer>
      <AccountHeader>
        <Header>
          <Link
            role="button"
            aria-label="Show account list"
            to={routes.accounts()}
          >
            <ProfilePicture src={getAccountImageUrl(accountName, account)} />
          </Link>
          <NetworkSwitcher />
        </Header>
      </AccountHeader>

      {children}

      <AccountFooter>
        <FooterTab to={routes.accountTokens()}>
          <AccountBalanceWalletIcon />
          <span>Tokens</span>
        </FooterTab>
        <FooterTab to={routes.accountCollections()}>
          <PhotoLibraryIcon />
          <span>NFTs</span>
        </FooterTab>
        <FooterTab to={routes.accountActivity()}>
          <FormatListBulletedIcon />
          <span>Activity</span>
          {hasPendingTransactions && (
            <FooterTabBadge>{pendingTransactions.length}</FooterTabBadge>
          )}
        </FooterTab>
      </AccountFooter>
    </Container>
  )
}
