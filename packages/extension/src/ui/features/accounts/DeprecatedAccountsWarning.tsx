// FIXME: remove when depricated accounts do not longer work
import { FC } from "react"
import styled from "styled-components"

import { WarningIcon } from "../../components/Icons/WarningIcon"
import Row from "../../components/Row"

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

const Alert = styled(Row)`
  width: auto;
  background: ${({ theme }) => theme.red1};
  margin-top: 8px;
  border-radius: 13px;
  padding: 5px 10px;
  gap: 5px;
`

export const DeprecatedAccountsWarning: FC = () => (
  <Container>
    <Title>Upgrade Required</Title>
    <Alert>
      <WarningIcon />
      These accounts need to be upgraded
    </Alert>
  </Container>
)
