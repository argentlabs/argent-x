import { Button, P3 } from "@argent/ui"
import { MessageTypes } from "@argent/x-window"
import { Box, Spinner } from "@chakra-ui/react"
import { utils } from "ethers"
import { UnsecuredJWT } from "jose"
import Image from "next/image"
import { useRouter } from "next/router"
import { FC, PropsWithChildren, useEffect } from "react"
import { AccountInterface, Call, number, stark, uint256 } from "starknet"

import { Layout } from "../components/Layout"
import { Navigate } from "../components/Navigate"
import { useAccount } from "../hooks/account"
import { useTokenBalance } from "../hooks/balance"
import { useTokens } from "../hooks/token"
import { formatAddress } from "../services/account"
import { Token } from "../services/tokens/balances"
import Home from "."

const TokenBalance: FC<{ token: Token }> = ({
  token: { image, address, decimals, name, symbol },
}) => {
  const tokenWithBalance = useTokenBalance(address)
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      w="100%"
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
        {image && <Image src={image} alt={name} width={32} height={32} />}
        <span>{name}</span>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
        <span>{symbol}</span>
        <span>
          {tokenWithBalance ? (
            utils.formatUnits(tokenWithBalance?.balance, decimals)
          ) : (
            <Spinner size="sm" />
          )}
        </span>
      </Box>
    </Box>
  )
}

const TokensBalances: FC<{ address: string }> = ({ address }) => {
  const tokens = useTokens()

  if (!tokens) {
    return <Spinner />
  }

  return (
    <Box
      w="100%"
      bg="rgba(0,0,0,0.1)"
      borderRadius={2}
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      {tokens.map((token) => (
        <TokenBalance key={token.address} token={token} />
      ))}
    </Box>
  )
}

const ClickToCopy: FC<PropsWithChildren<{ value: string }>> = ({
  value,
  children,
}) => {
  return (
    <Box
      as="button"
      onClick={() => {
        navigator.clipboard.writeText(value)
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      cursor="pointer"
    >
      {children}
    </Box>
  )
}

const encodeTransactions = (transactions: Call[]): string => {
  const unsignedJwt = new UnsecuredJWT({
    transactions,
  }).encode()

  return unsignedJwt
}

const useHandleMessages = (account?: AccountInterface) => {
  const navigate = useRouter()
  useEffect(() => {
    if (!account) return

    const messageTarget: Window = window.opener ?? window.parent
    const handleMessage = (event: MessageEvent<MessageTypes>) => {
      console.log("WW", event.origin, event.data)
      if (event.data.type === "CONNECT_REQUEST") {
        const receiptResponse: MessageTypes = {
          type: "CONNECT_REQUEST_RECEIPT",
          data: {
            receiptId: "123",
          },
        }
        messageTarget.postMessage(receiptResponse, event.origin)
        const response: MessageTypes = {
          type: "CONNECT_RESPONSE",
          meta: { forReceiptId: "123" },
          data: {
            selectedAddress: account.address,
          },
        }
        messageTarget.postMessage(response, event.origin)
      }
      if (event.data.type === "SIGN_TRANSACTION_REQUEST") {
        const receiptResponse: MessageTypes = {
          type: "SIGN_TRANSACTION_REQUEST_RECEIPT",
          data: {
            receiptId: "333",
          },
        }
        messageTarget.postMessage(receiptResponse, event.origin)

        navigate.push(
          `/review?transactions=${encodeTransactions(
            event.data.data.transactions,
          )}`,
          "/review",
        )
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [account])
}

export default function Dashboard() {
  const navigate = useRouter()
  const { isValidating, account, error } = useAccount()

  useEffect(() => {
    const messageTarget: Window = window.opener ?? window.parent
    if (messageTarget && account && !isValidating) {
      messageTarget.postMessage(
        {
          type: "ARGENT_WEB_WALLET::CONNECT",
          payload: {
            address: account.address,
          },
        },
        "*",
      )
      if (window.opener) {
        window.close()
      }
    }
  }, [account, isValidating])
  useHandleMessages(account)

  if (error) {
    return <Navigate to="/" />
  }
  if (isValidating || !account) {
    return <Home />
  }
  return (
    <Layout maxW={330}>
      <P3
        mb={6}
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={1}
        flexDirection="column"
      >
        Wallet address:
        <ClickToCopy value={account.address}>
          <b>{formatAddress(account.address)}</b>
        </ClickToCopy>
      </P3>
      <TokensBalances address={account.address} />
      <Button
        onClick={() => {
          const encodedTransactions = encodeTransactions([
            {
              contractAddress:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              entrypoint: "transfer",
              calldata: stark.compileCalldata({
                to: account.address,
                value: {
                  type: "struct",
                  ...uint256.bnToUint256(number.toBN(200000000000)),
                },
              }),
            },
            {
              contractAddress:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              entrypoint: "transfer",
              calldata: stark.compileCalldata({
                to: account.address,
                value: {
                  type: "struct",
                  ...uint256.bnToUint256(number.toBN(400000000000)),
                },
              }),
            },
          ])

          console.log(`/review?transactions=${encodedTransactions}`)
          return navigate.push(
            `/review?transactions=${encodedTransactions}`,
            "/review",
          )
        }}
      >
        Send funds to self
      </Button>
    </Layout>
  )
}
