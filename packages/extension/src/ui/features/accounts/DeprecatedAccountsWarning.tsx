import { FC } from "react"
import styled from "styled-components"

import { WarningIcon } from "../../components/Icons/WarningIcon"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Title = styled.div`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
`

const Alert = styled.div`
  background: #c12026;
  margin-top: 8px;
  border-radius: 13px;
  padding: 5px 10px;

  svg {
    margin-right: 5px;
  }
`

export const DeprecatedAccountsWarning: FC = () => (
  <Container>
    <Title>Deprecated accounts</Title>
    <Alert>
      <WarningIcon />
      These accounts will disappear soon
    </Alert>
  </Container>
)
