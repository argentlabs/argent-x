import { FC } from "react"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { H2, P } from "../components/Typography"
import { messenger } from "../utils/messaging"

const SettingsScreen = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;

  > ${P} {
    margin: 16px 0;
  }
`

export const Settings: FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <SettingsScreen>
      <BackButton onClick={onBack} />
      <H2>Settings</H2>
      <P>
        You can reset the whitelist of DApps, so all DApps which want to connect
        to your wallet in the future need to go through the whitelist process
        again:
      </P>
      <Button
        onClick={() => {
          messenger.emit("RESET_WHITELIST", undefined)
          onBack?.()
        }}
      >
        Reset whitelist
      </Button>
    </SettingsScreen>
  )
}
