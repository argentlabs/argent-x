import { supportsSessions } from "@argent/x-sessions"
import type { StarknetWindowObject } from "get-starknet-core"
import { useCallback, useEffect, useState } from "react"
import { AccountInterface } from "starknet"
import { Header } from "../components/Header"

import { Button } from "@argent/ui"
import { InfoRow } from "../components/InfoRow"
import { truncateAddress } from "../services/address.service"
import {
  addWalletChangeListener,
  connectWallet,
  disconnectWallet,
  getChainId,
  removeWalletChangeListener,
  silentConnectWallet,
} from "../services/wallet.service"
import { TokenDapp } from "../components/TokenDapp"
import { Flex } from "@chakra-ui/react"

const StarknetKitDapp = () => {
  const [supportSessions, setSupportsSessions] = useState<boolean | null>(null)
  const [chain, setChain] = useState<string | undefined>(undefined)
  const [isConnected, setConnected] = useState(false)
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const [isSilentConnect, setIsSilentConnect] = useState(true)

  useEffect(() => {
    const handler = async () => {
      try {
        const wallet = await silentConnectWallet()
        const chainId = await getChainId(wallet?.provider as any)
        setChain(chainId)
        setConnected(!!wallet?.isConnected)
        if (wallet?.account) {
          setAccount(wallet.account as any)
        }
        setSupportsSessions(null)
        if (wallet?.selectedAddress && wallet.provider) {
          try {
            const sessionSupport = await supportsSessions(
              wallet.selectedAddress,
              wallet.provider,
            )
            setSupportsSessions(sessionSupport)
          } catch {
            setSupportsSessions(false)
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        setIsSilentConnect(false)
      }
    }

    ;(async () => {
      await handler()
      addWalletChangeListener(handler)
    })()

    return () => {
      removeWalletChangeListener(handler)
    }
  }, [])

  const handleConnectClick = useCallback(
    (
        connectWallet: (
          enableWebWallet: boolean,
        ) => Promise<StarknetWindowObject | undefined>,
        enableWebWallet = true,
      ) =>
      async () => {
        const wallet = await connectWallet(enableWebWallet)
        const chainId = await getChainId(wallet?.provider as any)
        setChain(chainId)
        setConnected(!!wallet?.isConnected)
        if (wallet?.account) {
          setAccount(wallet.account as any)
        }
        setSupportsSessions(null)
        if (wallet?.selectedAddress && wallet.provider) {
          try {
            const sessionSupport = await supportsSessions(
              wallet.selectedAddress,
              wallet.provider,
            )
            setSupportsSessions(sessionSupport)
          } catch {
            setSupportsSessions(false)
          }
        }
      },
    [],
  )

  const handleDisconnect = useCallback(
    () => async () => {
      try {
        await disconnectWallet()
        setChain(undefined)
        setConnected(false)
        setAccount(null)
        setSupportsSessions(null)
      } catch (e) {
        console.log(e)
      }
    },
    [],
  )

  if (isSilentConnect) {
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
          <p>Connecting wallet...</p>
        </Flex>
      </Flex>
    )
  }

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
        {isConnected ? (
          <>
            <Header isConnected disconnectFn={handleDisconnect()} />
            <InfoRow
              title="Wallet address:"
              content={account?.address && truncateAddress(account?.address)}
            />
            <InfoRow
              title="Supports sessions:"
              content={`${supportSessions}`}
            />
            <InfoRow title="Url:" content={chain} />
            {account && (
              <TokenDapp account={account} showSession={supportSessions} />
            )}
          </>
        ) : (
          <>
            <Header />
            <Button
              colorScheme="primary"
              onClick={handleConnectClick(connectWallet)}
              maxW={350}
            >
              Connect wallet with Starknetkit
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default StarknetKitDapp
