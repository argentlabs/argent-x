import {
  formatAddress,
  isAddress,
  isEqualAddress,
  nonNullable,
  parseAmount,
  prettifyCurrencyValue,
  prettifyTokenNumber,
  transferCalldataSchema,
} from "@argent/x-shared"
import { FieldError } from "@argent/x-ui"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import { formatUnits } from "ethers"
import type { Token } from "../../../shared/token/__new/types/token.model"
import { prettifyTokenBalance } from "../../../shared/token/prettifyTokenBalance"
import { routes } from "../../../shared/ui/routes"
import { delay } from "../../../shared/utils/delay"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { clientStarknetAddressService } from "../../services/address"
import { clientTokenService } from "../../services/tokens"
import { formatTokenBalance } from "../../services/tokens/utils"
import { getUint256CalldataFromBN } from "../../services/transactions"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { tokenBalancesForAccountAndTokenView } from "../../views/tokenBalances"
import { useTokenUnitAmountToCurrencyValue } from "../accountTokens/tokenPriceHooks"
import { useToken } from "../accountTokens/tokens.state"
import { useMaxFeeEstimateForTransfer } from "../accountTokens/useMaxFeeForTransfer"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { amountInputSchema } from "./amountInput"
import type { SendAmountAndAssetScreenProps } from "./SendAmountAndAssetScreen"
import { SendAmountAndAssetScreen } from "./SendAmountAndAssetScreen"
import { TokenAmountInput } from "./TokenAmountInput"

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
    tokenBalancesForAccountAndTokenView({ account, token }),
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
  const [fetchMaxFee, setFetchMaxFee] = useState(false)
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

  const {
    data: { maxFee, feeTokenAddress },
    error: maxFeeError,
    isValidating: maxFeeLoading,
  } = useMaxFeeEstimateForTransfer(tokenAddress, account, balance, fetchMaxFee)

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

      await clientTokenService.send({
        to: token.address,
        method: "transfer",
        calldata: transferCalldataSchema.parse({
          recipient,
          amount: getUint256CalldataFromBN(
            parseAmount(inputAmount, token.decimals).value,
          ),
        }),
        title: `Send ${prettifyTokenNumber(inputAmount)} ${token.symbol}`,
        shortTitle: `Send`,
        subtitle: `To: ${formattedRecipient}`,
        isMaxSend,
      })

      /**
       * wait for store state to propagate into the ui and show the action screen
       * otherwise the user will see a flash of the token screen here
       */
      await delay(0)
    }
    onCancel()
  }, [token, recipientAddress, inputAmount, onCancel, network.id, isMaxSend])

  const onMaxClick = useCallback(() => {
    setFetchMaxFee(true)
  }, [])

  useEffect(() => {
    if (fetchMaxFee && balance && nonNullable(maxFee)) {
      const tokenDecimals = token.decimals
      const tokenBalance = formatTokenBalance(Infinity, balance, tokenDecimals)

      const deductMaxFeeFromMaxAmount = isEqualAddress(
        tokenAddress,
        feeTokenAddress,
      )
      // Deduct maxFee + 10% of maxFee
      const deductedAmount = balance - maxFee - (maxFee * 10n) / 100n
      const maxAmount = deductMaxFeeFromMaxAmount ? deductedAmount : balance
      const formattedMaxAmount = formatUnits(maxAmount, tokenDecimals)

      setValue("isMaxSend", true)
      setValue("amount", maxAmount <= 0n ? tokenBalance : formattedMaxAmount, {
        shouldDirty: true,
      })
    }
  }, [
    balance,
    maxFee,
    token.decimals,
    setValue,
    tokenAddress,
    feeTokenAddress,
    fetchMaxFee,
  ])

  const parsedInputAmount = parseAmount(
    inputAmount || "0",
    token.decimals,
  ).value

  const parsedTokenBalance = useMemo(() => balance ?? 0n, [balance])

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

  const hasInputAmount = useMemo(
    () => parsedInputAmount !== 0n,
    [parsedInputAmount],
  )

  const validBalance = useMemo(
    () => balance !== undefined && balance > 0n,
    [balance],
  )

  const showMaxButton = useMemo(
    () => !hasInputAmount && !maxFeeError && validBalance,
    [hasInputAmount, maxFeeError, validBalance],
  )

  const leftText = useMemo(() => {
    if (!maxFeeError) {
      return prettifyCurrencyValue(currencyValue)
    }
    return <FieldError>Unable to estimate max</FieldError>
  }, [currencyValue, maxFeeError])

  const rightText = useMemo(
    () =>
      balance !== undefined ? (
        <span data-testid="tokenBalance">
          Balance: {prettifyTokenBalance({ ...token, balance })}
        </span>
      ) : null,
    [balance, token],
  )

  const isInvalid = useMemo(
    () =>
      hasAmountError ||
      !hasInputAmount ||
      isInputAmountGtBalance ||
      Boolean(maxFeeError?.message),
    [
      hasAmountError,
      hasInputAmount,
      isInputAmountGtBalance,
      maxFeeError?.message,
    ],
  )
  const submitButtonError = useMemo(
    () => (isInputAmountGtBalance ? `Insufficient balance` : undefined),
    [isInputAmountGtBalance],
  )

  const disableButton = useMemo(
    () => isInvalid || (fetchMaxFee && !maxFee),
    [fetchMaxFee, isInvalid, maxFee],
  )

  return (
    <SendAmountAndAssetScreen
      {...rest}
      onCancel={onCancel}
      onSubmit={() => void onSubmit()}
      isInvalid={disableButton}
      submitButtonError={submitButtonError}
      input={
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
                  setFetchMaxFee(false)
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
