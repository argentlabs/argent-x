import { BarBackButton, NavigationContainer } from "@argent/ui"
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { number } from "starknet"
import styled from "styled-components"

import { addToken } from "../../../shared/token/storage"
import { RequestToken, Token } from "../../../shared/token/type"
import { useAppState } from "../../app.state"
import { Button, ButtonGroupHorizontal } from "../../components/Button"
import { InfoCircle } from "../../components/Icons/InfoCircle"
import { InputText } from "../../components/InputText"
import Row from "../../components/Row"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { isValidAddress } from "../../services/addresses"
import { FormError, H2, WarningText } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { fetchTokenDetails } from "../accountTokens/tokens.service"
import { useTokensInNetwork } from "../accountTokens/tokens.state"

const AddTokenScreenWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0 32px 48px 32px;

  > form {
    width: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
  }

  ${Button} {
    margin-top: 64px;
  }
`

const TokenWarningWrapper = styled(Row)`
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 191, 61, 0.1);
  gap: 12px;
`

const ButtonSpacer = styled.div`
  display: flex;
  flex: 1;
`

const isDataComplete = (data: Partial<Token>): data is Token => {
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
  const [tokenDetails, setTokenDetails] = useState<Token>()
  const prevValidAddress = useRef("")
  const tokensInNetwork = useTokensInNetwork(switcherNetworkId)

  const validAddress = useMemo(() => {
    return isValidAddress(tokenAddress)
  }, [tokenAddress])

  const tokenExist = useMemo(
    () =>
      tokensInNetwork.some(
        (token) => defaultToken && token.address === defaultToken.address,
      ),
    [defaultToken, tokensInNetwork],
  )

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
      decimals: parseInt(tokenDecimals.toString(), 10) || 0,
    }),
    networkId: switcherNetworkId,
  }

  return (
    <NavigationContainer leftButton={hideBackButton ? null : <BarBackButton />}>
      <AddTokenScreenWrapper>
        <H2>Add tokens</H2>

        {tokenExist && (
          <TokenWarningWrapper>
            <InfoCircle />
            <WarningText>
              This action will edit tokens that are already listed in your
              wallet, which can be used to phish you. Only approve if you are
              certain that you mean to change what these tokens represent.
            </WarningText>
          </TokenWarningWrapper>
        )}

        <form
          onSubmit={async (e: React.FormEvent) => {
            e.preventDefault()
            compiledData.address = addressFormat64Byte(compiledData.address)
            if (isDataComplete(compiledData)) {
              try {
                await addToken(compiledData)
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
                    BigInt(e.target.value || "0")
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
          <ButtonSpacer />
          <ButtonGroupHorizontal>
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
          </ButtonGroupHorizontal>
        </form>
      </AddTokenScreenWrapper>
    </NavigationContainer>
  )
}
