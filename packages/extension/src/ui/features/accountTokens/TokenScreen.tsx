import { FC } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { inputAmountSchema, parseAmount } from "../../../shared/token"
import { prettifyCurrencyValue } from "../../../shared/tokenPrice.service"
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
import { useSelectedAccount } from "../accounts/accounts.state"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { TokenIcon } from "./TokenIcon"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
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
  margin-left: 5px;
`

const InlineBalanceAndSymbol = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
`

const TokenBalance = styled.div`
  font-size: 17px;
  text-align: center;
  color: #ffffff;
  margin-top: 8px;
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
  const account = useSelectedAccount()
  const { tokenDetails } = useTokensWithBalance(account)
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
  const currencyValue = useTokenBalanceToCurrencyValue(token)

  if (!token) {
    return <Navigate to={routes.accounts()} />
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
          <InlineBalanceAndSymbol>
            <CopyToClipboard text={balance}>
              <BalanceAmount>{balance}</BalanceAmount>
            </CopyToClipboard>
            <BalanceSymbol>{symbol}</BalanceSymbol>
          </InlineBalanceAndSymbol>
          {currencyValue !== undefined && (
            <TokenBalance>{prettifyCurrencyValue(currencyValue)}</TokenBalance>
          )}
        </BalanceAlert>

        <ButtonGroup
          as="form"
          onSubmit={handleSubmit(({ amount, recipient }) => {
            sendTransaction({
              to: address,
              method: "transfer",
              calldata: {
                recipient,
                amount: getUint256CalldataFromBN(parseAmount(amount, decimals)),
              },
            })
            navigate(routes.accountTokens())
          })}
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
