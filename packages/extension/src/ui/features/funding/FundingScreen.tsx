import {
  BarCloseButton,
  NavigationContainer,
  useToast,
  logos,
  icons,
} from "@argent/x-ui"
import { FC } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"

import { tryToMintFeeToken } from "../../../shared/devnet/mintFeeToken"
import { Option } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { A } from "../../components/TrackingLink"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { isFeatureEnabled } from "@argent/x-shared"
import { getLayerSwapUrl } from "./utils"
import { FundingOnRampOption } from "./FundingOnRampOption"
import { Grid } from "@chakra-ui/react"

const { EthereumLogo, CoinbaseLogo } = logos
const { QrIcon } = icons

export const FundingScreen: FC = () => {
  const { state } = useLocation()
  const account = useView(selectedAccountView)
  const navigate = useNavigate()
  const toast = useToast()

  if (!account) {
    return <Navigate to={routes.accounts()} />
  }

  const isMainnet = account.networkId === "mainnet-alpha"
  const isBanxaEnabled = isFeatureEnabled(process.env.FEATURE_BANXA)
  const isLayerswapEnabled = isFeatureEnabled(process.env.FEATURE_LAYERSWAP)
  const isDeprecatedAccount = false // isDeprecated(account) // Allow purchases on deprecated accounts as some people may want to buy some eth to transfer funds out of their wallet
  const isDevnet = account?.networkId === "localhost"
  const allowFiatPurchase = isBanxaEnabled && isMainnet && !isDeprecatedAccount
  const allowLayerswap = isLayerswapEnabled && isMainnet && !isDeprecatedAccount

  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
      title={isMainnet ? "Add funds" : "Add test funds"}
    >
      <PageWrapper>
        <Grid templateColumns="1fr" gap={4}>
          {isDevnet && (
            <Option
              title="Mint Ethereum"
              description="Only possible on devnets"
              icon={<EthereumLogo width={6} height={6} />}
              onClick={async () => {
                const success = await tryToMintFeeToken(account)

                if (success) {
                  toast({
                    title: "Minted 1 ETH",
                    description: "You can now send ETH to your account",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  })
                } else {
                  toast({
                    title: "Failed to mint ETH",
                    description: "Make sure you're using devnet",
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                  })
                }

                return navigate(routes.accountTokens())
              }}
            />
          )}
          <FundingOnRampOption
            allowFiatPurchase={allowFiatPurchase}
            isBanxaEnabled={isBanxaEnabled}
            isMainnet={isMainnet}
          />
          <Link to={routes.fundingQrCode()} state={state}>
            <Option
              title="From another Starknet wallet"
              icon={<QrIcon width={6} height={6} />}
              description="Argent X, Braavos, etc"
            />
          </Link>
          {allowLayerswap && (
            <A href={getLayerSwapUrl(account.address)} targetBlank>
              <Option
                title="From an exchange"
                description={"Coinbase, Binance, etc"}
                icon={<CoinbaseLogo width={6} height={6} />}
              />
            </A>
          )}
          {!isDevnet && (
            <Option
              title="Bridge funds"
              description="From Ethereum and other chains"
              icon={<EthereumLogo width={6} height={6} />}
              onClick={() => navigate(routes.fundingBridge(), { state })}
            />
          )}
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
