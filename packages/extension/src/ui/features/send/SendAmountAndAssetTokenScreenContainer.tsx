import {
  formatAddress,
  isAddress,
  parseAmount,
  prettifyTokenNumber,
  transferCalldataSchema,
} from "@argent/shared"
import { FieldError } from "@argent/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatUnits } from "ethers"
import { FC, useCallback, useMemo } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../shared/token/price"
import type { Token } from "../../../shared/token/__new/types/token.model"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { routes } from "../../routes"
import { DEFAULT_TOKEN_LENGTH } from "../../services/tokens/implementation"
import { formatTokenBalance } from "../../services/tokens/utils"
import { getUint256CalldataFromBN } from "../../services/transactions"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useTokenUnitAmountToCurrencyValue } from "../accountTokens/tokenPriceHooks"
import { useToken } from "../accountTokens/tokens.state"
import { useMaxFeeEstimateForTransfer } from "../accountTokens/useMaxFeeForTransfer"
import { amountInputSchema } from "./amountInput"
import {
  SendAmountAndAssetScreen,
  SendAmountAndAssetScreenProps,
} from "./SendAmountAndAssetScreen"
import { TokenAmountInput } from "./TokenAmountInput"
import { genericErrorSchema } from "../actions/feeEstimation/feeError"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { tokenService } from "../../services/tokens"
import { useLiveTokenBalanceForAccount } from "../accountTokens/useLiveTokenBalanceForAccount"
import { Spinner } from "@chakra-ui/react"
import { clientStarknetAddressService } from "../../services/address"
import {
  pickBestFeeToken,
  useFeeTokenBalances,
} from "../accountTokens/useFeeTokenBalance"

const formSchema = z.object({
  amount: amountInputSchema,
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
  const { tokenWithBalance, tokenBalanceLoading } =
    useLiveTokenBalanceForAccount({ token, account })
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
      balance={tokenWithBalance.balance}
      tokenBalanceLoading={tokenBalanceLoading}
      account={account}
      {...rest}
    />
  )
}

interface GuardedSendAmountAndAssetTokenScreenContainerProps
  extends SendAmountAndAssetScreenProps {
  token: Token
  balance?: bigint
  tokenBalanceLoading: boolean
  account: WalletAccount
}

const GuardedSendAmountAndAssetTokenScreenContainer: FC<
  GuardedSendAmountAndAssetTokenScreenContainerProps
> = ({
  onCancel,
  returnTo,
  token,
  balance,
  tokenBalanceLoading,
  account,
  ...rest
}) => {
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
    },
    resolver: zodResolver(formSchema),
  })
  const hasAmountError = "amount" in errors
  const { amount: inputAmount } = watch()
  const { ref, onChange, ...amountInputRest } = register("amount")
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()

  const network = useCurrentNetwork()

  const feeTokens = useFeeTokenBalances(account)
  const feeToken = pickBestFeeToken(feeTokens, { avoid: [tokenAddress] })

  const currencyValue = useTokenUnitAmountToCurrencyValue(token, inputAmount)

  const {
    data: maxFee,
    error: maxFeeError,
    isValidating: maxFeeLoading,
  } = useMaxFeeEstimateForTransfer(
    feeToken.address,
    tokenAddress,
    balance,
    account,
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
      })
    }
    onCancel()
  }, [network, inputAmount, onCancel, recipientAddress, token])

  const onMaxClick = useCallback(() => {
    if (balance && maxFee) {
      const tokenDecimals = token.decimals
      const tokenBalance = formatTokenBalance(
        DEFAULT_TOKEN_LENGTH,
        balance,
        tokenDecimals,
      )

      const maxAmount = balance - BigInt(maxFee)

      const formattedMaxAmount = formatUnits(maxAmount, tokenDecimals)
      setValue("amount", maxAmount <= 0n ? tokenBalance : formattedMaxAmount, {
        shouldDirty: true,
      })
    }
  }, [balance, maxFee, token.decimals, setValue])

  const parsedInputAmount = parseAmount(
    inputAmount || "0",
    token.decimals,
  ).value

  const parsedTokenBalance = balance || 0n

  const isInputAmountGtBalance = useMemo(() => {
    return (
      parsedInputAmount > (balance ?? 0n) ||
      (feeToken?.address === token.address &&
        (inputAmount === balance?.toString() ||
          parsedInputAmount + BigInt(maxFee ?? 0) > parsedTokenBalance))
    )
  }, [
    feeToken?.address,
    inputAmount,
    maxFee,
    parsedInputAmount,
    parsedTokenBalance,
    token.address,
    balance,
  ])

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

  const showMaxButton = !hasInputAmount && !maxFeeError && !tokenBalanceLoading
  const leftText = useMemo(() => {
    if (!maxFeeError) {
      return prettifyCurrencyValue(currencyValue)
    }

    const genericError = genericErrorSchema.safeParse(maxFeeError)
    if (genericError.success) {
      return <FieldError>{genericError.data.message}</FieldError>
    }
    return <FieldError>Unable to estimate max</FieldError>
  }, [currencyValue, maxFeeError])

  const rightTextOrLoading = balance ? (
    <span data-testid="tokenBalance">
      Balance: {prettifyTokenBalance({ ...token, balance })}
    </span>
  ) : tokenBalanceLoading ? (
    <Spinner color="neutrals.500" w={2} h={2} thickness={"1px"} />
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
                  onChange(e)
                }
              }}
              token={token}
              showMaxButton={showMaxButton}
              isMaxLoading={maxFeeLoading}
              leftText={leftText}
              rightText={rightTextOrLoading}
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
