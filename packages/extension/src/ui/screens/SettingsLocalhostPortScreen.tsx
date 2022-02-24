import { FC } from "react"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { InputText } from "../components/InputText"
import { H2, P } from "../components/Typography"
import { useLocalhostPort } from "../states/localhostPort"

const Wrapper = styled.div`
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

export const SettingsLocalhostPortScreen: FC = () => {
  const { localhostPort } = useLocalhostPort()

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <Wrapper>
        <H2>Localhost port</H2>
        <P>The port number of your local node.</P>
        <P>
          Accounts created with a given port can only be used with that port,
          even if you change this setting later.
        </P>
        <InputText
          placeholder="Localhost port"
          type="number"
          value={localhostPort}
          onChange={(e: any) => {
            useLocalhostPort.setState({ localhostPort: e.target.value })
          }}
        />
      </Wrapper>
    </>
  )
}
