import { BigNumber } from "@ethersproject/bignumber"
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { number } from "starknet"
import styled from "styled-components"

import { RequestToken } from "../../../shared/token"
import { useAppState } from "../../app.state"
import { BackButton } from "../../components/BackButton"
import { Button, ButtonGroupVertical } from "../../components/Button"
import { Header } from "../../components/Header"
import { InputText } from "../../components/InputText"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { isValidAddress } from "../../services/addresses"
import { FormError, H2 } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { fetchTokenDetails } from "../accountTokens/tokens.service"
import { TokenDetails, addToken } from "../accountTokens/tokens.state"

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

const isDataComplete = (
  data: Partial<TokenDetails>,
): data is Required<TokenDetails> => {
  if (
    data.address &&
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
  defaultToken?: RequestToken
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
            setTokenName(details.name || "")
            setTokenSymbol(details.symbol || "")
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
    ...(tokenName && { name: tokenName }),
    ...(tokenSymbol && { symbol: tokenSymbol }),
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
                addToken(compiledData)
                onSubmit?.()
                navigate(routes.accountTokens())
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
          {!loading && validAddress && (
            <>
              <InputText
                placeholder="Name"
                type="text"
                value={tokenName}
                disabled={loading || !validAddress}
                onChange={(e: any) => setTokenName(e.target.value)}
              />
              <InputText
                placeholder="Symbol"
                type="text"
                value={tokenSymbol}
                disabled={loading || !validAddress}
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
