import { supportsSessions } from "@argent/x-sessions"
import type { StarknetWindowObject } from "get-starknet-core"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AccountInterface } from "starknet"
import { Header } from "../components/Header"
import {
  Button,
  Code,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { ChevronDownIcon, CheckIcon } from "@chakra-ui/icons"

import { InfoRow } from "../components/InfoRow"
import { truncateAddress } from "../services/address.service"
import {
  addWalletAccountsChangedListener,
  addWalletNetworkChangedListener,
  connectWallet,
  disconnectWallet,
  getChainId,
  removeWalletAccountsChangedListener,
  removeWalletNetworkChangedListener,
  silentConnectWallet,
  switchNetwork,
} from "../services/wallet.service"
import { TokenDapp } from "../components/TokenDapp"

const chainIds = ["SN_MAIN", "SN_GOERLI", "SN_SEPOLIA"]

const StarknetKitDapp = () => {
  const [supportSessions, setSupportsSessions] = useState<boolean | null>(null)
  const [chainId, setChainId] = useState<string | undefined>(undefined)
  const [isConnected, setConnected] = useState(false)
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const [isSilentConnect, setIsSilentConnect] = useState(true)

  useEffect(() => {
    const onAccountsChanged = async () => {
      try {
        const wallet = await silentConnectWallet()
        const chainId = await getChainId(wallet?.provider as any)
        if (chainId && !chainIds.includes(chainId)) {
          chainIds.push(chainId)
        }
        setChainId(chainId)
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

    const onNetworkChanged = (chainId?: any) => {
      setChainId(chainId)
    }

    ;(async () => {
      await onAccountsChanged()
      addWalletAccountsChangedListener(onAccountsChanged)
      addWalletNetworkChangedListener(onNetworkChanged)
    })()

    return () => {
      removeWalletAccountsChangedListener(onAccountsChanged)
      removeWalletNetworkChangedListener(onNetworkChanged)
    }
  }, [])

  const handleNetworkClick = useCallback(async (chainId: string) => {
    try {
      await switchNetwork(chainId)
    } catch (e) {
      console.error(e)
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
        setChainId(chainId)
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
        setChainId(undefined)
        setConnected(false)
        setAccount(null)
        setSupportsSessions(null)
      } catch (e) {
        console.log(e)
      }
    },
    [],
  )

  const chainMenu = useMemo(() => {
    return (
      <Menu size={"2xs"}>
        <MenuButton as={Text} cursor={"pointer"}>
          <Code color="white" bg={"transparent"}>
            {chainId ?? "undefined"} <ChevronDownIcon />
          </Code>
        </MenuButton>
        <MenuList>
          {chainIds.map((id) => {
            const checked = id === chainId
            return (
              <MenuItem
                key={id}
                onClick={() => handleNetworkClick(id)}
                icon={<CheckIcon visibility={checked ? "visible" : "hidden"} />}
              >
                {id}
              </MenuItem>
            )
          })}
        </MenuList>
      </Menu>
    )
  }, [chainId, handleNetworkClick])

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
            <InfoRow title="Chain id:" content={chainMenu} />
            <InfoRow
              title="Wallet address:"
              content={account?.address && truncateAddress(account?.address)}
            />
            <InfoRow
              title="Supports sessions:"
              content={`${supportSessions}`}
            />
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
