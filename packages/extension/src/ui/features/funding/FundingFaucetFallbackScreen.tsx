import {
  BarBackButton,
  BarCloseButton,
  NavigationContainer,
  icons,
} from "@argent/x-ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Option } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../routes"
import { Alert } from "@argent/x-ui"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { A } from "../../components/TrackingLink"
import { Grid } from "@chakra-ui/react"
import { formatTruncatedAddress } from "@argent/x-shared"

const { DocumentIcon } = icons

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
      <PageWrapper>
        <Alert
          variant="info"
          size="sm"
          backgroundColor="black"
          title={`There is no token faucet available yet on ${network.name}`}
          mb={3}
        />
        <Grid templateColumns="1fr" gap={4}>
          <A href={bridgeUrl} targetBlank>
            <Option
              title="L1 ETH bridge"
              description={formatTruncatedAddress(L1_BRIDGE_CONTRACT_ADDRESS)}
              icon={<DocumentIcon width={6} height={6} />}
              copyValue={L1_BRIDGE_CONTRACT_ADDRESS}
            />
          </A>
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
