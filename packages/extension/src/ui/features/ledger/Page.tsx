import { FC, PropsWithChildren } from "react"
import styled from "styled-components"

import { ArgentXBanner } from "../../components/Icons/ArgentXBanner"
import { HelpIcon } from "./assets/Help"

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 46px 0;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: max(32px, 15vh);
`

export const LedgerPage: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PageWrapper>
      <Header>
        <ArgentXBanner />
        <HelpIcon style={{ cursor: "pointer" }} />
      </Header>
      <Content>{children}</Content>
    </PageWrapper>
  )
}
