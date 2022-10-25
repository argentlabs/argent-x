import { AbsoluteBox, icons } from "@argent/ui"
import { useScroll } from "@argent/ui"
import { FC, PropsWithChildren } from "react"
import styled, { css } from "styled-components"

import { ContentContainer } from "../../components/ContentContainer"
import { Header } from "../../components/Header"
import { Tab, TabBar } from "../../components/TabBar"
import { routes } from "../../routes"
import { AccountHeader } from "./AccountHeader"
import { useSelectedAccount } from "./accounts.state"
import { useAccountTransactions } from "./accountTransactions.state"

const { WalletIcon, NftIcon, ActivityIcon } = icons

export const DeprecatedContainer = styled.div<{
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

export const AccountContainer: FC<PropsWithChildren> = ({ children }) => {
  const account = useSelectedAccount()
  const { pendingTransactions } = useAccountTransactions(account)
  const { scrollRef, scroll } = useScroll()

  if (!account) {
    return <></>
  }

  return (
    <AbsoluteBox>
      <ContentContainer ref={scrollRef} navigationBarInset tabBarInset>
        {children}
      </ContentContainer>
      <AccountHeader scroll={scroll} />
      <TabBar>
        <Tab to={routes.accountTokens()} icon={<WalletIcon />} label="Tokens" />
        <Tab to={routes.accountCollections()} icon={<NftIcon />} label="NFTs" />
        <Tab
          to={routes.accountActivity()}
          icon={<ActivityIcon />}
          badgeLabel={pendingTransactions.length}
          label="Activity"
        />
      </TabBar>
    </AbsoluteBox>
  )
}
