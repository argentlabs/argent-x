import { FC } from "react"
import styled from "styled-components"

import { sendMessage } from "../../shared/messages"
import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { H2, P } from "../components/Typography"

const SettingsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 32px 48px;

  > ${P} {
    margin: 16px 0;
  }
`

export const SettingsScreen: FC<{ onBack?: () => void }> = ({ onBack }) => (
  <SettingsScreenWrapper>
    <BackButton onClick={onBack} />
    <H2>Settings</H2>
    <P>
      You can reset the whitelist of DApps, so all DApps which want to connect
      to your wallet in the future need to go through the whitelist process
      again:
    </P>
    <Button
      onClick={() => {
        sendMessage({ type: "RESET_WHITELIST" })
        onBack?.()
      }}
    >
      Reset whitelist
    </Button>
  </SettingsScreenWrapper>
)
