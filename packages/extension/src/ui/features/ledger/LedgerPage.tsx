import React, { Children, FC, PropsWithChildren } from "react"
import styled from "styled-components"

import { PageWrapper, Panel } from "../../components/FullScreenPage"
import { ArgentXBanner } from "../../components/Icons/ArgentXBanner"

const Header = styled.div`
  position: absolute;
  left: 56px;
  top: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export const LedgerPage: FC<PropsWithChildren> = ({ children }) => {
  const [panel, ...restChildren] = Children.toArray(children)
  return (
    <>
      <Header>
        <ArgentXBanner />
      </Header>
      <PageWrapper>
        <Panel>{restChildren}</Panel>
        <Panel>{panel}</Panel>
      </PageWrapper>
    </>
  )
}
