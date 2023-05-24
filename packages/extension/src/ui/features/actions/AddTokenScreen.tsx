import { BarBackButton, NavigationContainer } from "@argent/ui"
import { BigNumber } from "@ethersproject/bignumber"
import { FC, FormEvent, useCallback } from "react"
import styled from "styled-components"
import { ZodError } from "zod"

import { Token } from "../../../shared/token/type"
import { Button, ButtonGroupHorizontal } from "../../components/Button"
import { InfoCircle } from "../../components/Icons/InfoCircle"
import { InputText } from "../../components/InputText"
import Row from "../../components/Row"
import { Spinner } from "../../components/Spinner"
import { FormError, H2, WarningText } from "../../theme/Typography"

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

/** TODO: refactor: encapsulate form state inside AddTokenScreenProps */

interface AddTokenScreenProps {
  error: string
  tokenDetails?: Token
  hideBackButton?: boolean
  loading?: boolean
  onFormSubmit: () => void
  onReject?: () => void
  setTokenAddress: (x: string) => void
  setTokenDecimals: (x: string) => void
  setTokenName: (x: string) => void
  setTokenSymbol: (x: string) => void
  tokenAddress: string
  tokenExist: boolean
  tokenName: string
  tokenSymbol: string
  validAddress: boolean
  tokenDecimals?: string | number
  disableSubmit: boolean
}

export const AddTokenScreen: FC<AddTokenScreenProps> = ({
  error,
  hideBackButton,
  loading,
  onFormSubmit,
  onReject,
  setTokenAddress,
  setTokenDecimals,
  setTokenName,
  setTokenSymbol,
  tokenAddress,
  tokenDetails,
  tokenDecimals,
  tokenExist,
  tokenName,
  tokenSymbol,
  validAddress,
  disableSubmit,
}) => {
  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      onFormSubmit()
    },
    [onFormSubmit],
  )
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

        <form onSubmit={onSubmit}>
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
          <ButtonSpacer />
          <ButtonGroupHorizontal>
            {onReject && (
              <Button onClick={onReject} type="button">
                Reject
              </Button>
            )}
            <Button type="submit" disabled={disableSubmit}>
              Continue
            </Button>
          </ButtonGroupHorizontal>
        </form>
      </AddTokenScreenWrapper>
    </NavigationContainer>
  )
}
