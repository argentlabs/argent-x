import LedgerSigner from "@argent/ledger-signer"
import LedgerUsbTransport from "@ledgerhq/hw-transport-webusb"
import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { Title } from "../../components/Page"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { FormError } from "../../theme/Typography"
import { BlackCircle } from "./assets/BlackCircle"
import { LedgerStartIllustration } from "./assets/LedgerStart"
import { ContentWrapper, LedgerPage } from "./Page"
import { StepIndicator } from "./StepIndicator"
import { Steps } from "./Steps"

export const StyledButton = styled(Button)`
  width: fit-content;
  padding-left: 32px;
  padding-right: 32px;
  margin: 8px auto 0;
`

export const LedgerStartScreen: FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [detecting, setDetecting] = useState(false)

  return (
    <LedgerPage>
      {detecting ? (
        <BlackCircle>
          <Spinner size={64} />
        </BlackCircle>
      ) : (
        <LedgerStartIllustration />
      )}
      <ContentWrapper>
        <StepIndicator length={3} currentIndex={0} />
        <Title style={{ margin: "32px 0" }}>
          {detecting ? "Detecting Ledger..." : "Connect a new Ledger"}
        </Title>
        <Steps
          steps={[
            { title: "Plug in and unlock your Ledger device" },
            {
              title: "Open (or install) the StarkNet app",
              description: "The StarkNet app can be installed via Ledger Live",
            },
          ]}
          style={{ marginBottom: 8 }}
        />
        {error && <FormError>{error}</FormError>}
        <StyledButton
          style={{ marginTop: 32 }}
          onClick={async () => {
            setDetecting(true)
            setError("")
            try {
              const tp = await LedgerUsbTransport.create().catch((e) => {
                console.error(e)
                throw new Error("No Ledger device found")
              })

              const signer = new LedgerSigner(
                "m/2645'/1195502025'/1148870696'/0'/0'/0",
                tp,
              )
              await signer.getPubKey().catch((e) => {
                console.error(e)
                throw new Error(
                  "Make sure your Ledger is unlocked and StarkNet app is open",
                )
              })
              navigate(routes.ledgerSelect())
            } catch (e) {
              console.error(e)
              if (e instanceof Error) {
                setError(e.message)
              }
            }

            setDetecting(false)
          }}
          variant="primary"
          disabled={detecting}
        >
          Continue
        </StyledButton>
      </ContentWrapper>
    </LedgerPage>
  )
}
