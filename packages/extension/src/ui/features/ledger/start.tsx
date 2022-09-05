import { FC } from "react"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ArgentXBanner } from "../../components/Icons/ArgentXBanner"
import { Title } from "../../components/Page"
import { HelpIcon } from "./assets/Help"
import { LedgerStartIllustration } from "./assets/LedgerStart"
import { Steps } from "./Steps"

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 46px 0;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: max(32px, 15vh);
`

const StyledButton = styled(Button)`
  margin-top: 40px;
  max-width: 312px;
`

export const LedgerStartScreen: FC = () => {
  return (
    <PageWrapper>
      <Header>
        <ArgentXBanner />
        <HelpIcon style={{ cursor: "pointer" }} />
      </Header>
      <Content>
        <LedgerStartIllustration />
        <Title style={{ margin: "32px 0" }}>Connect a new Ledger</Title>
        <Steps
          steps={[
            { title: "Plug in and unlock your Ledger device" },
            {
              title: "Open (or install) the StarkNet app",
              description: "The StarkNet app can be installed via Ledger Live",
            },
          ]}
        />
        <StyledButton variant="inverted">Continue</StyledButton>
      </Content>
    </PageWrapper>
  )
}
