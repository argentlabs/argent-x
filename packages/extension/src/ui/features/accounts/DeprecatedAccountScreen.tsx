// FIXME: remove when depricated accounts do not longer work
import { FC } from "react"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { H2, P } from "../../theme/Typography"

const Container = styled.div`
  padding: 88px 40px 24px 40px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 68px);

  ${P}, li {
    font-size: 16px;
    line-height: 19px;
    font-weight: 600;
    margin-top: 15px;
  }

  ol {
    padding-left: 20px;
  }
`

interface DeprecatedAccountScreenProps {
  onSubmit: () => void
}

export const DeprecatedAccountScreen: FC<DeprecatedAccountScreenProps> = ({
  onSubmit,
}) => {
  return (
    <Container>
      <H2>This account must be migrated</H2>
      <P>StarkNet is in Alpha and the Goerli network has breaking changes.</P>
      <ol>
        <li>Copy the address of your new account.</li>
        <li>
          Transfer all your assets from this account to your new one. You may
          need to use a dapp to do this.
        </li>
        <li>
          When finished, hide the old account from view by clicking the trash
          can next to it when hovering.{" "}
          <b>
            You will not be able to restore these accounts, so make sure to send
            out all funds first
          </b>
        </li>
      </ol>

      <Button style={{ marginTop: 32 }} onClick={onSubmit}>
        I understand
      </Button>
    </Container>
  )
}
