import LedgerSigner from "@argent/ledger-signer"
import LedgerUsbTransport from "@ledgerhq/hw-transport-webusb"
import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import { StarknetChainId } from "starknet/dist/constants"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { Title } from "../../components/Page"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { FormError } from "../../theme/Typography"
import { BlackCircle } from "./assets/BlackCircle"
import { LedgerStartIllustration } from "./assets/LedgerStart"
import { LedgerPage } from "./Page"
import { StepIndicator } from "./StepIndicator"
import { Steps } from "./Steps"

const StyledButton = styled(Button)`
  width: fit-content;
  padding-left: 32px;
  padding-right: 32px;
  margin: 8px auto 0;
`

const StyledStepIndicator = styled(StepIndicator)`
  margin-top: 32px;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 600px;
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
        <StyledStepIndicator length={3} currentIndex={0} />
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
          style={{ marginBottom: 32 }}
        />
        {error && <FormError>{error}</FormError>}
        <StyledButton
          onClick={async () => {
            navigate(routes.ledgerSelect())
            setDetecting(true)
            setError("")
            try {
              const tp = await LedgerUsbTransport.create()
              const signer = new LedgerSigner(
                "m/2645'/1195502025'/1148870696'/0'/0'/0",
                tp,
              )
              console.log(signer)
              try {
                console.log(await signer.getPubKey())
                const tx = await signer.signTransaction(
                  [
                    {
                      contractAddress:
                        "0x04483e2798fb2763773775d9b055a87deca913806b9e41c18ffa67bd6d826641",
                      entrypoint: "transfer",
                      calldata: ["0x0", "0x1", "0x2", "0x3"],
                    },
                  ],
                  {
                    chainId: StarknetChainId.TESTNET,
                    maxFee: "0x10000",
                    nonce: "0x0",
                    version: "0x0",
                    walletAddress:
                      "0x04483e2798fb2763773775d9b055a87deca913806b9e41c18ffa67bd6d826641",
                  },
                )
                console.log(tx)
              } catch (e) {
                console.error(e)
                if (e instanceof Error) {
                  setError(`Ledger: ${e.message}`)
                }
              }
            } catch (e) {
              console.error(e)
              if (e instanceof Error) {
                setError(`Transport: ${e.message}`)
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
