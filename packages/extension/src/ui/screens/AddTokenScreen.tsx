import { BigNumber } from "@ethersproject/bignumber"
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { number } from "starknet"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { InputText } from "../components/Input"
import { Spinner } from "../components/Spinner"
import { H2 } from "../components/Typography"
import { isValidAddress } from "../utils/addresses"
import { TokenDetails, fetchTokenDetails } from "../utils/tokens"

const AddTokenScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;

  > form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  ${Button} {
    margin-top: 64px;
  }
`

const isDataComplete = (data: TokenDetails) => {
  if (
    isValidAddress(data.address) &&
    data.balance?.toString() &&
    data.decimals?.toString() &&
    data.name &&
    data.symbol
  )
    return true
  return false
}

function addressFormat64Byte(address: number.BigNumberish): string {
  return `0x${number.toBN(address).toString("hex").padStart(64, "0")}`
}

interface AddTokenScreenProps {
  walletAddress: string
  networkId: string
  onSubmit?: (addToken: {
    address: string
    symbol: string
    name: string
    decimals: string
    networkId: string
  }) => void
  onBack?: () => void
}

export const AddTokenScreen: FC<AddTokenScreenProps> = ({
  walletAddress,
  networkId,
  onSubmit,
  onBack,
}) => {
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenDecimals, setTokenDecimals] = useState("0")
  const [loading, setLoading] = useState(false)
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>()
  const prevValidAddress = useRef("")

  const validAddress = useMemo(() => {
    return isValidAddress(tokenAddress)
  }, [tokenAddress])

  useEffect(() => {
    if (loading) {
      fetchTokenDetails(tokenAddress, walletAddress, networkId)
        .then((details) => {
          setLoading(false)
          setTokenDetails(details)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
          setTokenDetails(undefined)
        })
    } else if (
      isValidAddress(tokenAddress) &&
      tokenAddress !== prevValidAddress.current
    ) {
      prevValidAddress.current = tokenAddress
      setLoading(true)
    }
  }, [loading, tokenAddress, walletAddress])

  const compiledData = {
    address: tokenAddress,
    ...(tokenDetails ?? {}),
    ...(!tokenDetails?.name && { name: tokenName }),
    ...(!tokenDetails?.symbol && { symbol: tokenSymbol }),
    ...(!tokenDetails?.decimals && {
      decimals: BigNumber.from(tokenDecimals || "0"),
    }),
    networkId,
  }

  return (
    <AddTokenScreenWrapper>
      <BackButton onClick={onBack} />
      <H2>Add token</H2>

      <form
        onSubmit={() => {
          if (isDataComplete(compiledData)) {
            onSubmit?.({
              address: compiledData.address,
              decimals: compiledData.decimals!.toString(),
              name: compiledData.name!,
              symbol: compiledData.symbol!,
              networkId: compiledData.networkId,
            })
          }
        }}
      >
        <InputText
          autoFocus
          placeholder="Contract address"
          type="text"
          value={tokenAddress}
          disabled={loading}
          onChange={(e: any) => {
            setTokenAddress(e.target.value?.toLowerCase())
          }}
          onBlur={() => {
            try {
              if (tokenAddress)
                setTokenAddress(addressFormat64Byte(tokenAddress))
            } catch {}
          }}
        />
        {!loading && (
          <>
            <InputText
              placeholder="Name"
              type="text"
              value={tokenDetails?.name ?? tokenName}
              disabled={tokenDetails?.name || loading || !validAddress}
              onChange={(e: any) => setTokenName(e.target.value)}
            />
            <InputText
              placeholder="Symbol"
              type="text"
              value={tokenDetails?.symbol ?? tokenSymbol}
              disabled={tokenDetails?.symbol || loading || !validAddress}
              onChange={(e: any) => setTokenSymbol(e.target.value)}
            />
            <InputText
              placeholder="Decimals"
              type="text"
              value={tokenDetails?.decimals?.toString() ?? tokenDecimals}
              disabled={
                tokenDetails?.decimals?.toString() || loading || !validAddress
              }
              onChange={(e: any) => {
                try {
                  BigNumber.from(e.target.value || "0")
                  setTokenDecimals(e.target.value)
                } catch {}
              }}
            />
            <Button type="submit" disabled={!isDataComplete(compiledData)}>
              Continue
            </Button>
          </>
        )}
        {loading && <Spinner size={64} />}
      </form>
    </AddTokenScreenWrapper>
  )
}
