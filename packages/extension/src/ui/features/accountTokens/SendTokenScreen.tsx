import { BigNumber, utils } from "ethers"
import { FC, useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import {
  getFeeToken,
  inputAmountSchema,
  parseAmount,
} from "../../../shared/token"
import { Button } from "../../components/Button"
import Column, { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { AtTheRateIcon } from "../../components/Icons/AtTheRateIcon"
import { StyledControlledInput } from "../../components/InputText"
import { Spinner } from "../../components/Spinner"
import { H3 } from "../../components/Typography"
import { routes } from "../../routes"
import { useAddressBook } from "../../services/addressBook"
import { addressSchema } from "../../services/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { AddressBookMenu } from "../accounts/AddressBookMenu"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { TokenIcon } from "./TokenIcon"
import { TokenMenu } from "./TokenMenu"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { formatTokenBalance, toTokenView } from "./tokens.service"
import { TokenDetailsWithBalance, useTokensWithBalance } from "./tokens.state"
import { useMaxFeeEstimateForTransfer } from "./useMaxFeeForTransfer"

export const BalanceText = styled.div`
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: #8f8e8c;
`

export const StyledIconBar = styled(IconBar)`
  align-items: flex-start;
`

export const StyledForm = styled.form`
  padding: 24px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`

export const InputGroupAfter = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
`

export const InputGroupBefore = styled(InputGroupAfter)`
  right: unset;
  left: 16px;
`

export const StyledMaxButton = styled(Button)`
  border-radius: 100px;
  background-color: #5c5b59;
  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  margin-top: 0 !important;
  padding: 4px 8px;
`

export const AtTheRateWrapper = styled(StyledMaxButton)<{ active?: boolean }>`
  padding: 6px;
  background-color: ${({ active }) => active && "#ffffff"};

  :active,
  :focus {
    background-color: #ffffff;
  }

  svg {
    path {
      fill: ${({ active }) => (active ? "#000000" : "#ffffff")};
    }
  }
`

export const InputTokenSymbol = styled.span`
  text-transform: uppercase;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: #8f8e8c;
`

export const FormError = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: #c12026;
  margin-top: 8px;
  margin-left: 8px;
  text-align: left;
`

export const CurrencyValueText = styled(InputTokenSymbol)`
  font-weight: 400;
`

export interface SendInput {
  recipient: string
  amount: string
}

const SendSchema: Schema<SendInput> = object().required().shape({
  recipient: addressSchema,
  amount: inputAmountSchema,
})

export const SendTokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams<{ tokenAddress: string }>()
  const account = useSelectedAccount()
  const { tokenDetails } = useTokensWithBalance(account)
  const resolver = useYupValidationResolver(SendSchema)
  const feeToken = account && getFeeToken(account.networkId)
  const [maxClicked, setMaxClicked] = useState(false)

  const { id: currentNetworkId } = useCurrentNetwork()

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
    setValue,
    watch,
  } = useForm<SendInput>({
    defaultValues: {
      recipient: "",
      amount: "",
    },
    resolver,
  })

  const formValues = watch()

  const inputAmount = formValues.amount

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  const currencyValue = useTokenBalanceToCurrencyValue(token)

  const {
    maxFee,
    error: maxFeeError,
    loading: maxFeeLoading,
  } = useMaxFeeEstimateForTransfer(token?.address, token?.balance, account)

  const setMaxInputAmount = useCallback(
    (token: TokenDetailsWithBalance, maxFee?: BigNumber) => {
      const tokenDecimals = token.decimals?.toNumber() || 18
      const tokenBalance = formatTokenBalance(token.balance, tokenDecimals)

      if (token.balance && maxFee) {
        const balanceBn = token.balance

        const maxAmount = balanceBn.sub(maxFee.toString())

        const formattedMaxAmount = utils.formatUnits(
          maxAmount.toString(),
          tokenDecimals,
        )
        setValue("amount", maxAmount.lte(0) ? tokenBalance : formattedMaxAmount)
      }
    },
    [setValue],
  )

  const [addressBookOpen, setAddressBookOpen] = useState(false)

  const addressBook = useAddressBook(account?.networkId || currentNetworkId)

  useEffect(() => {
    if (maxClicked && maxFee && token) {
      setMaxInputAmount(token, maxFee)
    }
  }, [
    maxClicked,
    maxFee,
    setMaxInputAmount,
    token,
    token?.address,
    token?.networkId,
  ])

  if (!token) {
    return <Navigate to={routes.accounts()} />
  }

  const { address, name, symbol, balance, decimals, image } = toTokenView(token)

  const parsedInputAmount = inputAmount
    ? parseAmount(inputAmount, decimals)
    : parseAmount("0", decimals)

  const parsedTokenBalance = token.balance || parseAmount("0", decimals)

  const isInputAmountGtBalance =
    parsedInputAmount.gt(token.balance?.toString() ?? 0) ||
    (feeToken?.address === token.address &&
      (inputAmount === balance ||
        parsedInputAmount.add(maxFee?.toString() ?? 0).gt(parsedTokenBalance)))

  const handleMaxClick = () => {
    setMaxClicked(true)
    setMaxInputAmount(token, maxFee)
  }

  const handleAddressSelect = (address: string) => {
    setValue("recipient", address)
    setAddressBookOpen(false)
  }

  const disableSubmit =
    !isDirty ||
    isSubmitting ||
    (submitCount > 0 && !isDirty) ||
    isInputAmountGtBalance // Balance: 1234, maxInput: 1231, , maxFee: 3, updatedInput: 1233

  return (
    <div style={{ position: "relative" }}>
      <StyledIconBar back childAfter={<TokenMenu tokenAddress={address} />}>
        <ColumnCenter>
          <H3>Send {symbol}</H3>
          <BalanceText>{`${balance} ${symbol}`}</BalanceText>
        </ColumnCenter>
      </StyledIconBar>

      <ColumnCenter>
        <StyledForm
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
          <Column gap="12px">
            <div>
              <StyledControlledInput
                autoComplete="off"
                control={control}
                placeholder="Amount"
                name="amount"
                type="text"
                onKeyDown={() => {
                  setMaxClicked(false)
                }}
                onlyNumeric
                style={{ padding: "17px 16px 17px 57px" }}
              >
                <InputGroupBefore>
                  <TokenIcon name={name} url={image} size={32} />
                </InputGroupBefore>
                <InputGroupAfter>
                  {inputAmount ? (
                    <CurrencyValueText>{currencyValue}</CurrencyValueText>
                  ) : (
                    <>
                      <InputTokenSymbol>{token.symbol}</InputTokenSymbol>
                      <StyledMaxButton type="button" onClick={handleMaxClick}>
                        {maxFeeLoading ? <Spinner size={18} /> : "MAX"}
                      </StyledMaxButton>
                    </>
                  )}
                </InputGroupAfter>
              </StyledControlledInput>
              {inputAmount && isInputAmountGtBalance && (
                <FormError>Insufficient balance</FormError>
              )}
              {maxFeeError && <FormError>{maxFeeError.message}</FormError>}
              {errors.amount && <FormError>{errors.amount.message}</FormError>}
            </div>

            <div>
              <StyledControlledInput
                autoComplete="off"
                control={control}
                placeholder="Recipient's address"
                name="recipient"
                type="text"
                style={{
                  paddingRight: "50px",
                  borderRadius: addressBookOpen ? "8px 8px 0 0" : "8px",
                }}
              >
                <>
                  <InputGroupAfter>
                    <AtTheRateWrapper
                      type="button"
                      onClick={() => setAddressBookOpen(!addressBookOpen)}
                      active={addressBookOpen}
                    >
                      <AtTheRateIcon />
                    </AtTheRateWrapper>
                  </InputGroupAfter>

                  {addressBookOpen && (
                    <AddressBookMenu
                      addressBook={addressBook}
                      onAddressSelect={handleAddressSelect}
                    />
                  )}
                </>
              </StyledControlledInput>
              {errors.recipient && (
                <FormError>{errors.recipient.message}</FormError>
              )}
            </div>
          </Column>

          <Button disabled={disableSubmit} type="submit">
            Next
          </Button>
        </StyledForm>
      </ColumnCenter>
    </div>
  )
}
