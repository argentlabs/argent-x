import LedgerSigner from "@argent/ledger-signer"
import LedgerUsbTransport from "@ledgerhq/hw-transport-webusb"
import { FC } from "react"
import { StarknetChainId } from "starknet/dist/constants"
import styled from "styled-components"

import { baseDerivationPath } from "../../../shared/wallet.service"
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
        <StyledButton
          onClick={async () => {
            const tp = await LedgerUsbTransport.create()
            const signer = new LedgerSigner(
              "m/2645'/1195502025'/1148870696'/0'/0'/0",
              tp,
            )
            console.log(signer)
            console.log(await signer.getPubKey())
            const tx = await signer.signTransaction(
              [
                {
                  contractAddress:
                    "0x04483e2798fb2763773775d9b055a87deca913806b9e41c18ffa67bd6d826641",
                  entrypoint: "__execute__",
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
          }}
          variant="inverted"
        >
          Continue
        </StyledButton>
      </Content>
    </PageWrapper>
  )
}
