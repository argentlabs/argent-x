import { FC } from "react"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { PrivacyStatementText } from "../../components/PrivacyStatementText"
import { H2 } from "../../theme/Typography"

const Container = styled.div`
  padding: 24px 40px 24px;
  display: flex;
  flex-direction: column;
`

export const SettingsPrivacyStatementScreen: FC = () => {
  return (
    <>
      <IconBar back />
      <Container>
        <H2>Privacy statement</H2>
        <PrivacyStatementText />
      </Container>
    </>
  )
}
