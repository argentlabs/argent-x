import { goerli } from "@starknet-react/chains"
import {
  Connector,
  StarknetConfig,
  publicProvider,
  useAccount,
  useConnect,
  useDisconnect,
} from "@starknet-react/core"
import getConfig from "next/config"
import {
  ArgentMobileConnector,
  isInArgentMobileAppBrowser,
} from "starknetkit/argentMobile"
import { InjectedConnector } from "starknetkit/injected"
import { WebWalletConnector } from "starknetkit/webwallet"
import { Header } from "../components/Header"

import { Flex, Image } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { InfoRow } from "../components/InfoRow"
import { TokenDapp } from "../components/TokenDapp"
import { truncateAddress } from "../services/address.service"

const { publicRuntimeConfig } = getConfig()
const { webWalletUrl, argentMobileChainId } = publicRuntimeConfig

export const availableConnectors = [
  new InjectedConnector({ options: { id: "argentX" } }),
  new InjectedConnector({ options: { id: "braavos" } }),
  new ArgentMobileConnector({
    dappName: "Example dapp",
    chainId: argentMobileChainId,
  }),
  new WebWalletConnector({ url: webWalletUrl }),
]

const StarknetReactDappContent = () => {
  const chains = [goerli]

  const { account, status } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isClient, setIsClient] = useState(false)

  /* https://nextjs.org/docs/messages/react-hydration-error#solution-1-using-useeffect-to-run-on-the-client-only
  starknet react had an issue with the `available` method
  need to check their code, probably is executed only on client causing an hydration issue
  */
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <></>
  }

  const inAppBrowserFilter = (c: Connector) => {
    if (isInArgentMobileAppBrowser()) {
      return c.id === "argentX"
    }
    return c
  }

  return (
    <>
      {status === "connected" ? (
        <>
          <Header isConnected disconnectFn={disconnect} />
          <InfoRow
            title="Wallet address:"
            content={account?.address && truncateAddress(account?.address)}
          />
          <InfoRow title="Url:" content={chains[0].name} />
          {account && (
            <TokenDapp account={account} showSession={null} starknetReact />
          )}
        </>
      ) : (
        <>
          <Header />
          <Flex direction="column" gap="3">
            {connectors.filter(inAppBrowserFilter).map((connector) => {
              if (!connector.available()) {
                return <React.Fragment key={connector.id} />
              }
              const icon = connector.icon.dark ?? ""
              const isSvg = icon?.startsWith("<svg")

              return (
                <Flex
                  as="button"
                  key={connector.id}
                  borderRadius="full"
                  onClick={() => connect({ connector })}
                  alignItems="center"
                  background="neutrals.700"
                  _hover={{
                    background: "neutrals.600",
                  }}
                  cursor="pointer"
                  maxW="350px"
                  gap="2"
                  py="2"
                  px="4"
                >
                  {isSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: icon }} />
                  ) : (
                    <Image
                      alt={connector.name}
                      src={icon}
                      height="32px"
                      width="32px"
                    />
                  )}
                  {connector.name}
                </Flex>
              )
            })}
          </Flex>
        </>
      )}
    </>
  )
}

const StarknetReactDapp = () => {
  const chains = [goerli]
  const providers = publicProvider()

  return (
    <Flex py="0" px="2rem">
      <Flex
        as="main"
        minHeight="100vh"
        py="4rem"
        px="0"
        flex="1"
        flexDirection="column"
      >
        <StarknetConfig
          chains={chains}
          provider={providers}
          connectors={availableConnectors as Connector[]}
        >
          <StarknetReactDappContent />
        </StarknetConfig>
      </Flex>
    </Flex>
  )
}

export default StarknetReactDapp
