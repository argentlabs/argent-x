import {
  formatAddress,
  isAddress,
  nonNullable,
  parseAmount,
  transferCalldataSchema,
  prettifyTokenNumber,
  prettifyCurrencyValue,
} from "@argent/x-shared"
import { FieldError } from "@argent/x-ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC, useCallback, useMemo } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import { prettifyTokenBalance } from "../../../shared/token/prettifyTokenBalance"
import type { Token } from "../../../shared/token/__new/types/token.model"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { routes } from "../../routes"
import { formatTokenBalance } from "../../services/tokens/utils"
import { getUint256CalldataFromBN } from "../../services/transactions"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useTokenUnitAmountToCurrencyValue } from "../accountTokens/tokenPriceHooks"
import { useToken } from "../accountTokens/tokens.state"
import { amountInputSchema } from "./amountInput"
import {
  SendAmountAndAssetScreen,
  SendAmountAndAssetScreenProps,
} from "./SendAmountAndAssetScreen"
import { TokenAmountInput } from "./TokenAmountInput"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { tokenService } from "../../services/tokens"
import { clientStarknetAddressService } from "../../services/address"
import { useMaxFeeEstimateForTransfer } from "../accountTokens/useMaxFeeForTransfer"
import { useBestFeeToken } from "../actions/useBestFeeToken"
import { formatUnits } from "ethers"
import { tokenBalanceForAccountAndTokenView } from "../../views/tokenBalances"

const formSchema = z.object({
  amount: amountInputSchema,
  isMaxSend: z.boolean(),
})

type FormType = z.infer<typeof formSchema>

export const SendAmountAndAssetTokenScreenContainer: FC<
  SendAmountAndAssetScreenProps
> = ({ tokenAddress, ...rest }) => {
  const account = useView(selectedAccountView)
  const token = useToken({
    address: tokenAddress,
    networkId: account?.networkId || "Unknown",
  })
  const tokenWithBalance = useView(
    tokenBalanceForAccountAndTokenView({ token, account }),
  )

  if (!token) {
    return null
  }
  if (!tokenWithBalance) {
    return null
  }
  if (!account) {
    return null
  }

  return (
    <GuardedSendAmountAndAssetTokenScreenContainer
      tokenAddress={tokenAddress}
      token={token}
      balance={BigInt(tokenWithBalance.balance)}
      account={account}
      {...rest}
    />
  )
}

interface GuardedSendAmountAndAssetTokenScreenContainerProps
  extends SendAmountAndAssetScreenProps {
  token: Token
  balance?: bigint
  account: WalletAccount
}

const GuardedSendAmountAndAssetTokenScreenContainer: FC<
  GuardedSendAmountAndAssetTokenScreenContainerProps
> = ({ onCancel, returnTo, token, balance, account, ...rest }) => {
  const navigate = useNavigate()
  const { recipientAddress, tokenAddress, amount: propAmount } = rest
  const {
    watch,
    setValue,
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<FormType>({
    defaultValues: {
      amount: propAmount || "",
      isMaxSend: false,
    },
    resolver: zodResolver(formSchema),
  })
  const hasAmountError = "amount" in errors
  const { amount: inputAmount, isMaxSend } = watch()
  const { ref, onChange, ...amountInputRest } = register("amount")
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()

  const network = useCurrentNetwork()

  const currencyValue = useTokenUnitAmountToCurrencyValue(token, inputAmount)

  const feeToken = useBestFeeToken(account)
  const {
    data: maxFee,
    error: maxFeeError,
    isValidating: maxFeeLoading,
  } = useMaxFeeEstimateForTransfer(
    feeToken.address,
    tokenAddress,
    account,
    balance,
  )

  const onSubmit = useCallback(async () => {
    if (token && recipientAddress && inputAmount) {
      if (!isAddress(token.address)) {
        console.warn("Invalid address", token.address)
        return
      }
      const recipient = await clientStarknetAddressService.parseAddressOrDomain(
        recipientAddress,
        network.id,
      )
      const formattedRecipient = isAddress(recipient)
        ? formatAddress(recipient)
        : recipient

      await tokenService.send({
        to: token.address,
        method: "transfer",
        calldata: transferCalldataSchema.parse({
          recipient,
          amount: getUint256CalldataFromBN(
            parseAmount(inputAmount, token.decimals).value,
          ),
        }),
        title: `Send ${prettifyTokenNumber(inputAmount)} ${token.symbol}`,
        subtitle: `to ${formattedRecipient}`,
        isMaxSend,
      })
    }
    onCancel()
  }, [token, recipientAddress, inputAmount, onCancel, network.id, isMaxSend])

  const onMaxClick = useCallback(() => {
    if (balance && nonNullable(maxFee)) {
      const tokenDecimals = token.decimals
      const tokenBalance = formatTokenBalance(Infinity, balance, tokenDecimals)

      const maxAmount = balance - maxFee
      const formattedMaxAmount = formatUnits(maxAmount, tokenDecimals)

      setValue("isMaxSend", true)
      setValue("amount", maxAmount <= 0n ? tokenBalance : formattedMaxAmount, {
        shouldDirty: true,
      })
    }
  }, [balance, maxFee, token.decimals, setValue])

  const parsedInputAmount = parseAmount(
    inputAmount || "0",
    token.decimals,
  ).value
  const parsedTokenBalance = balance ?? 0n
  const isInputAmountGtBalance = useMemo(() => {
    return parsedInputAmount > parsedTokenBalance
  }, [parsedInputAmount, parsedTokenBalance])

  const onAmountInputSubmit: SubmitHandler<FormType> = useCallback(
    (_data) => {
      if (parsedInputAmount === 0n) {
        setError("amount", {
          type: "custom",
          message: "Amount is required",
        })
      } else if (isInputAmountGtBalance) {
        setError("amount", {
          type: "custom",
          message: "Insufficient balance",
        })
      } else {
        void onSubmit()
      }
    },
    [isInputAmountGtBalance, onSubmit, parsedInputAmount, setError],
  )

  const onTokenClick = useCallback(() => {
    navigate(
      routes.sendAssetScreen({
        recipientAddress,
        tokenAddress,
        amount: inputAmount,
        returnTo,
      }),
    )
  }, [inputAmount, navigate, recipientAddress, returnTo, tokenAddress])

  const hasInputAmount = parsedInputAmount !== 0n

  const validBalance = balance !== undefined && balance > 0n

  const showMaxButton = !hasInputAmount && !maxFeeError && validBalance
  const leftText = useMemo(() => {
    if (!maxFeeError) {
      return prettifyCurrencyValue(currencyValue)
    }
    return <FieldError>Unable to estimate max</FieldError>
  }, [currencyValue, maxFeeError])

  const rightText =
    balance !== undefined ? (
      <span data-testid="tokenBalance">
        Balance: {prettifyTokenBalance({ ...token, balance })}
      </span>
    ) : null

  const isInvalid =
    hasAmountError ||
    !hasInputAmount ||
    isInputAmountGtBalance ||
    Boolean(maxFeeError?.message)
  const submitButtonError = isInputAmountGtBalance
    ? `Insufficient balance`
    : undefined

  return (
    <SendAmountAndAssetScreen
      {...rest}
      onCancel={onCancel}
      onSubmit={onSubmit}
      isInvalid={isInvalid}
      submitButtonError={submitButtonError}
      input={
        <form onSubmit={handleSubmit(onAmountInputSubmit)}>
          <>
            <TokenAmountInput
              {...amountInputRest}
              ref={(e) => {
                ref(e)
                inputRef.current = e
              }}
              value={inputAmount}
              onChange={(e) => {
                /** Disallow non-schema characters */
                if (amountInputSchema.safeParse(e.target.value).success) {
                  setValue("isMaxSend", false)
                  void onChange(e)
                }
              }}
              token={token}
              showMaxButton={showMaxButton}
              isMaxLoading={maxFeeLoading}
              leftText={leftText}
              rightText={rightText}
              onMaxClick={onMaxClick}
              onTokenClick={onTokenClick}
              isInvalid={isInvalid}
            />
            {hasAmountError && (
              <FieldError>{errors.amount?.message}</FieldError>
            )}
          </>
        </form>
      }
    />
  )
}
