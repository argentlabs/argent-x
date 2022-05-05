import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import styled, { css } from "styled-components"

import { routes } from "../../routes"
import { useSelectedAccount } from "../../states/account"
import {
  getAccountName,
  useAccountMetadata,
} from "../../states/accountMetadata"
import { getAccountImageUrl } from "../../utils/accounts"
import { Header } from "../Header"
import {
  AccountBalanceWalletIcon,
  FormatListBulletedIcon,
  PhotoLibraryIcon,
} from "../Icons/MuiIcons"
import { NetworkSwitcher } from "../NetworkSwitcher"
import { AccountFooter, FooterTab } from "./AccountFooter"
import { AccountHeader } from "./AccountHeader"
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
`

interface AccountScreenContentProps {
  children?: ReactNode
}

export const AccountContainer: FC<AccountScreenContentProps> = ({
  children,
}) => {
  const { accountNames } = useAccountMetadata()
  const account = useSelectedAccount()

  if (!account) {
    return <></>
  }
  const accountName = getAccountName(account, accountNames)

  return (
    <Container header footer>
      <AccountHeader>
        <Header>
          <Link to={routes.accounts()}>
            <ProfilePicture
              src={getAccountImageUrl(accountName, account.address)}
            />
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
        <FooterTab to={routes.accountNfts()}>
          <PhotoLibraryIcon />
          <span>Collectibles</span>
        </FooterTab>
        <FooterTab to={routes.accountActivity()}>
          <FormatListBulletedIcon />
          <span>Activity</span>
        </FooterTab>
      </AccountFooter>
    </Container>
  )
}
