import {
  BarBackButton,
  BarCloseButton,
  NavigationContainer,
  logosDeprecated,
} from "@argent/x-ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Option } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../../shared/ui/routes"
import { A } from "../../components/TrackingLink"
import { Grid } from "@chakra-ui/react"

const { StarknetLogo, BlastLogo } = logosDeprecated

export const FundingFaucetSepoliaScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
      title="Get test ETH & STRK"
    >
      <PageWrapper>
        <Grid templateColumns="1fr" gap={4}>
          <A href="https://starknet-faucet.vercel.app/" targetBlank>
            <Option
              title="Starknet Foundation faucet"
              icon={<StarknetLogo width={6} height={6} />}
              description="Get test ETH & STRK"
            />
          </A>
          <A
            href="https://blastapi.io/faucets/starknet-sepolia-eth"
            targetBlank
          >
            <Option
              title="Blast ETH faucet"
              icon={<BlastLogo width={6} height={6} />}
              description="Get test ETH"
            />
          </A>
          <A
            href="https://blastapi.io/faucets/starknet-sepolia-strk"
            targetBlank
          >
            <Option
              title="Blast STRK faucet"
              icon={<BlastLogo width={6} height={6} />}
              description="Get test STRK"
            />
          </A>
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
