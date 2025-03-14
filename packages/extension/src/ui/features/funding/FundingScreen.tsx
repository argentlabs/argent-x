import { QrIcon, BridgeIcon } from "@argent/x-ui/icons"
import {
  BarCloseButton,
  CellStack,
  NavigationContainer,
  useToast,
} from "@argent/x-ui"
import type { FC } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"

import { tryToMintAllFeeTokens } from "../../../shared/devnet/mintFeeToken"
import { Option } from "../../components/Option"
import { TrackingLink } from "../../components/TrackingLink"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { isFeatureEnabled } from "@argent/x-shared"
import { getLayerSwapUrl } from "./utils"
import { FundingOnRampOption } from "./FundingOnRampOption"

import { EthereumLogo, CoinbaseLogo } from "@argent/x-ui/logos-deprecated"

export const FundingScreen: FC = () => {
  const { state } = useLocation()
  const account = useView(selectedAccountView)
  const navigate = useNavigate()
  const toast = useToast()

  if (!account) {
    return <Navigate to={routes.accounts()} />
  }

  const isMainnet = account.networkId === "mainnet-alpha"
  const isSepolia = account.networkId === "sepolia-alpha"
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
      <CellStack>
        {isDevnet && (
          <Option
            title="Mint Ethereum and Stark"
            description="Only possible on devnets"
            icon={<EthereumLogo width={6} height={6} />}
            /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
            onClick={async () => {
              const success = await tryToMintAllFeeTokens(account)

              if (success) {
                toast({
                  title: "Minted 1 ETH and 1 STRK",
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
          isSepolia={isSepolia}
        />
        <Option
          as={Link}
          to={routes.fundingQrCode()}
          state={state}
          title="From another Starknet wallet"
          icon={<QrIcon width={6} height={6} />}
          description="Argent X, Braavos, etc"
        />
        {allowLayerswap && (
          <Option
            as={TrackingLink}
            href={getLayerSwapUrl(account.address)}
            targetBlank
            title="From an exchange"
            description="Coinbase, Binance, etc"
            icon={<CoinbaseLogo width={6} height={6} />}
          />
        )}
        {!isDevnet && (
          <Option
            title="Bridge funds"
            description="From Ethereum and other chains"
            icon={<BridgeIcon width={6} height={6} />}
            onClick={() => navigate(routes.fundingBridge(), { state })}
          />
        )}
      </CellStack>
    </NavigationContainer>
  )
}
