import { FC } from "react"
import styled from "styled-components"

import { P } from "../../theme/Typography"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"

interface ConnectDappProps extends ConfirmPageProps {
  host: string
}

const Code = styled.code`
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  padding: 0 0.5em;
`

export const ConnectDappScreen: FC<ConnectDappProps> = ({ host, ...props }) => (
  <ConfirmScreen title="Connect to dapp" confirmButtonText="Connect" {...props}>
    <P>
      <Code>{host}</Code> wants to connect to your wallet. If you allow this
      request the website will be able to read your wallet addresses and request
      transactions, which you still need to sign.
    </P>
  </ConfirmScreen>
)
