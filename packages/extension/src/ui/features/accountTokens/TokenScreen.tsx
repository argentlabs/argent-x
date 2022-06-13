import { ethers } from "ethers"
import { FC } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { inputAmountSchema } from "../../../shared/token"
import { Alert } from "../../components/Alert"
import { Button, ButtonGroup } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { ControlledInputText } from "../../components/InputText"
import { FormError } from "../../components/Typography"
import { routes } from "../../routes"
import { addressSchema } from "../../services/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { TokenIcon } from "./TokenIcon"
import { toTokenView } from "./tokens.service"
import { useTokensWithBalance } from "./tokens.state"

export const TokenScreenWrapper = styled.div`
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
    margin-top: 24px;
  }
`

export const TokenTitle = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`

export const TokenName = styled.h3`
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: #ffffff;
`

export const BalanceAlert = styled(Alert)`
  padding-top: 32px;
  padding-bottom: 32px;
  margin-bottom: 20px;
`

const BalanceTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
`

const BalanceAmount = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 34px;
  line-height: 41px;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const BalanceSymbol = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 25px;
`

interface SendInput {
  recipient: string
  amount: string
}
const SendSchema: Schema<SendInput> = object().required().shape({
  recipient: addressSchema,
  amount: inputAmountSchema,
})

export const TokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams()
  const { tokenDetails } = useTokensWithBalance()
  const resolver = useYupValidationResolver(SendSchema)
  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
  } = useForm<SendInput>({
    defaultValues: {
      recipient: "",
      amount: "",
    },
    resolver,
  })

  const disableSubmit = isSubmitting || (submitCount > 0 && !isDirty)

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  if (!token) {
    return <></>
  }

  const { address, name, symbol, balance, decimals, image } = toTokenView(token)

  return (
    <>
      <IconBar back />
      <TokenScreenWrapper>
        <TokenTitle>
          <TokenIcon url={image} name={name} large />
          <TokenName>{name}</TokenName>
        </TokenTitle>
        <BalanceAlert>
          <BalanceTitle>Your balance</BalanceTitle>
          <CopyToClipboard text={balance}>
            <BalanceAmount>{balance}</BalanceAmount>
          </CopyToClipboard>
          <BalanceSymbol>{symbol}</BalanceSymbol>
        </BalanceAlert>

        <ButtonGroup
          as="form"
          onSubmit={handleSubmit(
            ({ amount, recipient }) => {
              console.log("SUBMITTED")
              sendTransaction({
                to: address,
                method: "transfer",
                calldata: {
                  recipient,
                  amount: getUint256CalldataFromBN(
                    ethers.utils.parseUnits(amount, decimals),
                  ),
                },
              })
              navigate(routes.accountTokens())
            },
            (e) => {
              console.log("ERROR", e)
            },
          )}
        >
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Amount"
            name="amount"
            type="text"
          />
          {errors.amount && <FormError>{errors.amount.message}</FormError>}
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Recipient"
            name="recipient"
            type="text"
          />
          {errors.recipient && (
            <FormError>{errors.recipient.message}</FormError>
          )}
          <Button disabled={disableSubmit} type="submit">
            Send
          </Button>
          <Button onClick={() => navigate(routes.hideToken(token.address))}>
            Hide
          </Button>
        </ButtonGroup>
      </TokenScreenWrapper>
    </>
  )
}
