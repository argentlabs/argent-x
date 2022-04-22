import { BigNumber } from "@ethersproject/bignumber"
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { number } from "starknet"
import styled from "styled-components"

import { AddToken } from "../../shared/token.model"
import { BackButton } from "../components/BackButton"
import { Button, ButtonGroupVertical } from "../components/Button"
import { Header } from "../components/Header"
import { InputText } from "../components/InputText"
import { Spinner } from "../components/Spinner"
import { FormError, H2 } from "../components/Typography"
import { routes } from "../routes"
import { useSelectedAccount } from "../states/account"
import { useAppState } from "../states/app"
import { TokenDetails, addToken } from "../states/tokens"
import { isValidAddress } from "../utils/addresses"
import { fetchTokenDetails } from "../utils/tokens"

const AddTokenScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 48px 32px;

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

const isDataComplete = (data: TokenDetails): data is Required<TokenDetails> => {
  if (
    isValidAddress(data.address) &&
    data.decimals?.toString() &&
    data.name &&
    data.symbol
  ) {
    return true
  }
  return false
}

function addressFormat64Byte(address: number.BigNumberish): string {
  return `0x${number.toBN(address).toString("hex").padStart(64, "0")}`
}

interface AddTokenScreenProps {
  defaultToken?: AddToken
  hideBackButton?: boolean
  onSubmit?: () => void
  onReject?: () => void
}

export const AddTokenScreen: FC<AddTokenScreenProps> = ({
  defaultToken,
  hideBackButton,
  onSubmit,
  onReject,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const account = useSelectedAccount()
  const [tokenAddress, setTokenAddress] = useState(defaultToken?.address || "")
  const [tokenName, setTokenName] = useState(defaultToken?.name || "")
  const [tokenSymbol, setTokenSymbol] = useState(defaultToken?.symbol || "")
  const [tokenDecimals, setTokenDecimals] = useState(
    defaultToken?.decimals || "0",
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>()
  const prevValidAddress = useRef("")

  const validAddress = useMemo(() => {
    return isValidAddress(tokenAddress)
  }, [tokenAddress])

  useEffect(() => {
    if (
      defaultToken &&
      defaultToken.address === tokenAddress &&
      !tokenDetails
    ) {
      setLoading(true)
    }
  }, [defaultToken, tokenAddress, tokenDetails])

  useEffect(() => {
    if (account) {
      if (loading && account) {
        fetchTokenDetails(tokenAddress, account)
          .then((details) => {
            setTokenDetails(details)
          })
          .catch(() => {
            setTokenDetails(undefined)
          })
          .finally(() => {
            setLoading(false)
          })
      } else if (
        isValidAddress(tokenAddress) &&
        tokenAddress !== prevValidAddress.current
      ) {
        prevValidAddress.current = tokenAddress
        setLoading(true)
      }
    }
  }, [loading, tokenAddress, account])

  const compiledData = {
    address: tokenAddress,
    ...(tokenDetails ?? {}),
    ...(!tokenDetails?.name && { name: tokenName }),
    ...(!tokenDetails?.symbol && { symbol: tokenSymbol }),
    ...(!tokenDetails?.decimals && {
      decimals: BigNumber.from(tokenDecimals || "0"),
    }),
    networkId: switcherNetworkId,
  }

  return (
    <>
      <Header hide={hideBackButton}>
        <BackButton />
      </Header>

      <AddTokenScreenWrapper>
        <H2>Add tokens</H2>

        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault()
            compiledData.address = addressFormat64Byte(compiledData.address)
            if (isDataComplete(compiledData)) {
              try {
                addToken({
                  address: compiledData.address,
                  decimals: compiledData.decimals,
                  name: compiledData.name,
                  symbol: compiledData.symbol,
                  networkId: compiledData.networkId,
                })
                onSubmit?.()
                navigate(routes.account())
              } catch (e) {
                setError("Token already exists")
              }
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
          />
          {!loading && (
            <>
              <InputText
                placeholder="Name"
                type="text"
                value={tokenDetails?.name || tokenName}
                disabled={tokenDetails?.name || loading || !validAddress}
                onChange={(e: any) => setTokenName(e.target.value)}
              />
              <InputText
                placeholder="Symbol"
                type="text"
                value={tokenDetails?.symbol || tokenSymbol}
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
                  } catch {
                    // pass
                  }
                }}
              />
              {error && <FormError>{error}</FormError>}
            </>
          )}
          {loading && <Spinner size={64} style={{ marginTop: 50 }} />}
          <ButtonGroupVertical>
            {onReject && (
              <Button onClick={onReject} type="button">
                Reject
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || !isDataComplete(compiledData)}
            >
              Continue
            </Button>
          </ButtonGroupVertical>
        </form>
      </AddTokenScreenWrapper>
    </>
  )
}
