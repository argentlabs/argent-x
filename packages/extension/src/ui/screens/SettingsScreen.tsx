import { FC } from "react"
import styled from "styled-components"

import { sendMessage } from "../../shared/messages"
import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { H2, P } from "../components/Typography"

const SettingsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;

  > ${P} {
    margin: 16px 0;
  }
`

export const SettingsScreen: FC<{ onBack?: () => void }> = ({ onBack }) => (
  <SettingsScreenWrapper>
    <BackButton onClick={onBack} />
    <H2>Settings</H2>
    <P>
      Dapps you have previously connected to can auto-connect in the future.
      Require all dapps to request a new connection to your wallet?
    </P>
    <Button
      onClick={() => {
        sendMessage({ type: "RESET_WHITELIST" })
        onBack?.()
      }}
    >
      Reset dapp connections
    </Button>
  </SettingsScreenWrapper>
)
