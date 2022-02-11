import { FC } from "react"
import styled from "styled-components"

import { DappsList } from "../components/Account/DappsList"
import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { H2, P } from "../components/Typography"

const DappsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 24px 32px;

  ${P} {
    margin: 16px 0;
  }

  ${Button} {
    margin-top: 10px;
  }
`

export const DappsScreen: FC = () => {
  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <DappsScreenWrapper>
        <H2>Dapp Connections</H2>
        <DappsList />
      </DappsScreenWrapper>
    </>
  )
}
