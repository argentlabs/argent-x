import { DocumentIcon } from "@argent/x-ui/icons"
import {
  Alert,
  BarBackButton,
  BarCloseButton,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Option } from "../../components/Option"
import { routes } from "../../../shared/ui/routes"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { TrackingLink } from "../../components/TrackingLink"
import { formatTruncatedAddress } from "@argent/x-shared"

const L1_BRIDGE_CONTRACT_ADDRESS = "0xaea4513378eb6023cf9ce730a26255d0e3f075b9"

export const FundingFaucetFallbackScreen: FC = () => {
  const navigate = useNavigate()
  const network = useCurrentNetwork()

  const bridgeUrl = `${network.l1ExplorerUrl}/address/${L1_BRIDGE_CONTRACT_ADDRESS}#writeProxyContract`

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
      title="Add test funds"
    >
      <CellStack>
        <Alert
          variant="info"
          size="sm"
          backgroundColor="black"
          title={`There is no token faucet available yet on ${network.name}`}
          mb={3}
        />
        <Option
          as={TrackingLink}
          href={bridgeUrl}
          targetBlank
          title="L1 ETH bridge"
          description={formatTruncatedAddress(L1_BRIDGE_CONTRACT_ADDRESS)}
          icon={<DocumentIcon />}
          copyValue={L1_BRIDGE_CONTRACT_ADDRESS}
        />
      </CellStack>
    </NavigationContainer>
  )
}
