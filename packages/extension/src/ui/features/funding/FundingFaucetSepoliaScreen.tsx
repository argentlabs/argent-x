import {
  BarBackButton,
  BarCloseButton,
  CellStack,
  logosDeprecated,
  NavigationContainer,
} from "@argent/x-ui"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Option } from "../../components/Option"
import { routes } from "../../../shared/ui/routes"
import { TrackingLink } from "../../components/TrackingLink"

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
      <CellStack>
        <Option
          as={TrackingLink}
          href="https://starknet-faucet.vercel.app/"
          targetBlank
          title="Starknet Foundation faucet"
          icon={<StarknetLogo />}
          description="Get test ETH & STRK"
        />
        <Option
          as={TrackingLink}
          href="https://blastapi.io/faucets/starknet-sepolia-eth"
          targetBlank
          title="Blast ETH faucet"
          icon={<BlastLogo />}
          description="Get test ETH"
        />
        <Option
          as={TrackingLink}
          href="https://blastapi.io/faucets/starknet-sepolia-strk"
          targetBlank
          title="Blast STRK faucet"
          icon={<BlastLogo />}
          description="Get test STRK"
        />
      </CellStack>
    </NavigationContainer>
  )
}
