import { P3 } from "@argent/ui"
import { Box, Spinner } from "@chakra-ui/react"
import { utils } from "ethers"
import Image from "next/image"
import { FC, PropsWithChildren } from "react"
import useSwr from "swr"

import { Layout } from "../components/Layout"
import { Navigate } from "../components/Navigate"
import { formatAddress, getAccount } from "../services/account"
import { getTokensBalances } from "../services/tokens/balances"
import Home from "."

const TokensBalances: FC<{ address: string }> = ({ address }) => {
  const { data: tokensBalances } = useSwr(
    ["services/tokens/balances/getTokensBalances", address],
    () => getTokensBalances(address),
    { refreshInterval: 60000 },
  )

  if (!tokensBalances) {
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
      {tokensBalances.map(
        ({ balance, address, symbol, decimals, name, image }) => (
          <Box
            key={address}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            w="100%"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              {image && <Image src={image} alt={name} width={32} height={32} />}
              <span>{name}</span>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              <span>{symbol}</span>
              <span>{utils.formatUnits(balance, decimals)}</span>
            </Box>
          </Box>
        ),
      )}
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

export default function Dashboard() {
  const { isValidating, data, error } = useSwr("services/account", () =>
    getAccount(),
  )
  if (error) {
    return <Navigate to="/" />
  }
  if (isValidating || !data) {
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
        <ClickToCopy value={data.address}>
          <b>{formatAddress(data.address)}</b>
        </ClickToCopy>
      </P3>
      <TokensBalances address={data.address} />
    </Layout>
  )
}