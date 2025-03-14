import type {
  Address,
  LiquidStakingInvestment,
  StrkDelegatedStakingInvestment,
  Token,
} from "@argent/x-shared"
import { isEqualAddress, nonNullable, parseAmount } from "@argent/x-shared"
import { FieldError } from "@argent/x-ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatUnits } from "ethers/utils"
import type { FC } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"
import { ampli } from "../../../../shared/analytics"
import { STRK_TOKEN_ADDRESS } from "../../../../shared/network/constants"
import { prettifyTokenBalance } from "../../../../shared/token/prettifyTokenBalance"
import { routes } from "../../../../shared/ui/routes"
import { addQueryToUrl } from "../../../../shared/utils/url"
import type { WalletAccount } from "../../../../shared/wallet.model"
import { useAutoFocusInputRef } from "../../../hooks/useAutoFocusInputRef"
import { useNavigateReturnToOr } from "../../../hooks/useNavigateReturnTo"
import { useParseQuery } from "../../../hooks/useParseQuery"
import {
  useCurrentPathnameWithQuery,
  useRouteAccountDefi,
} from "../../../hooks/useRoute"
import { stakingService } from "../../../services/staking"
import { formatTokenBalance } from "../../../services/tokens/utils"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { selectedNetworkIdView } from "../../../views/network"
import { tokenBalancesForAccountAndTokenView } from "../../../views/tokenBalances"
import { useToken } from "../../accountTokens/tokens.state"
import { amountInputSchema } from "../../send/amountInput"
import { TokenAmountInput } from "../../send/TokenAmountInput"
import { useInvestmentProviderInfo } from "./hooks/useInvestmentProviderInfo"
import { useMaxFeeForStaking } from "./hooks/useMaxFeeForStaking"
import { StakingScreen } from "./StakingScreen"
import { useNativeFeeToken } from "../../actions/useNativeFeeToken"

const querySchema = z.object({
  amount: amountInputSchema,
})

const formSchema = z.object({
  amount: amountInputSchema,
  isMaxSend: z.boolean(),
})

type FormType = z.infer<typeof formSchema>

interface StakingScreenContainerProps {
  investment?: StrkDelegatedStakingInvestment | LiquidStakingInvestment
  resetToDefaultInvestment: () => void
  showEditProvider: boolean
}

export const StakingScreenContainer: FC<StakingScreenContainerProps> = ({
  investment,
  resetToDefaultInvestment,
  showEditProvider,
}) => {
  const account = useView(selectedAccountView)
  const token = useToken({
    address: STRK_TOKEN_ADDRESS,
    networkId: account?.networkId || "Unknown",
  })
  const tokenWithBalance = useView(
    tokenBalancesForAccountAndTokenView({ account, token }),
  )

  if (!investment || !token || !tokenWithBalance || !account) {
    return null
  }

  return (
    <GaurdedNativeStakingScreenContainer
      token={token}
      balance={BigInt(tokenWithBalance.balance)}
      account={account}
      investment={investment}
      resetToDefaultInvestment={resetToDefaultInvestment}
      showEditProvider={showEditProvider}
    />
  )
}

interface GaurdedNativeStakingScreenContainerProps
  extends StakingScreenContainerProps {
  token: Token
  balance: bigint
  account: WalletAccount
}

export const GaurdedNativeStakingScreenContainer: FC<
  GaurdedNativeStakingScreenContainerProps
> = ({
  token,
  balance,
  account,
  investment,
  resetToDefaultInvestment,
  showEditProvider,
}) => {
  const defaultValues = useParseQuery(querySchema)

  const navigate = useNavigate()
  const defiRoute = useRouteAccountDefi()

  // not using useNavigateReturnTo because this is a restoration route, and in that case there is no returnTo
  const goBack = useNavigateReturnToOr(routes.staking.path)
  const onBack = useCallback(() => {
    goBack()
    resetToDefaultInvestment()
  }, [goBack, resetToDefaultInvestment])
  const onCancel = onBack

  const selectedNetworkId = useView(selectedNetworkIdView)
  const currentPath = useCurrentPathnameWithQuery()

  const [fetchMaxFee, setFetchMaxFee] = useState(false)

  const {
    watch,
    setValue,
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<FormType>({
    defaultValues: {
      amount: defaultValues.amount ?? "",
      isMaxSend: false,
    },
    resolver: zodResolver(formSchema),
  })
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()
  const { amount: inputAmount } = watch()
  const { ref, onChange, ...amountInputRest } = register("amount")
  const hasAmountError = "amount" in errors

  const parsedInputAmount = parseAmount(
    inputAmount || "0",
    token.decimals,
  ).value

  const hasInputAmount = useMemo(
    () => parsedInputAmount !== 0n,
    [parsedInputAmount],
  )

  const nativeFeeToken = useNativeFeeToken(account)
  const providerInfo = useInvestmentProviderInfo(investment)

  const {
    data: maxFee,
    error: maxFeeError,
    isValidating: maxFeeLoading,
  } = useMaxFeeForStaking({
    feeTokenAddress: nativeFeeToken?.address,
    tokenAddress: token.address,
    stakerInfo: { ...providerInfo, address: account.address },
    investmentId: investment?.id,
    fetch: fetchMaxFee,
    account,
    balance,
  })

  const parsedTokenBalance = useMemo(() => balance ?? 0n, [balance])

  const isInputAmountGtBalance = useMemo(() => {
    return parsedInputAmount > parsedTokenBalance
  }, [parsedInputAmount, parsedTokenBalance])

  const validBalance = useMemo(
    () => balance !== undefined && balance > 0n,
    [balance],
  )

  const showMaxButton = useMemo(
    () => !hasInputAmount && !maxFeeError && validBalance,
    [hasInputAmount, maxFeeError, validBalance],
  )

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

  const onProviderEdit = useCallback(() => {
    const returnToWithState = addQueryToUrl(currentPath, {
      amount: inputAmount,
    })
    ampli.stakingEditButtonClicked()

    if (investment?.category === "strkDelegatedStaking") {
      void navigate(routes.nativeStakingSelect(returnToWithState))
    } else {
      void navigate(routes.liquidStakingSelect(returnToWithState))
    }
  }, [inputAmount, navigate, currentPath, investment])

  const onSubmit = useCallback(async () => {
    if (!investment) {
      return
    }
    const parsedAmount = parseAmount(inputAmount, token.decimals)

    await stakingService.stake({
      investmentId: investment.id,
      stakerInfo: { ...providerInfo, address: account.address },
      accountAddress: account.address as Address,
      tokenAddress: token.address,
      amount: parsedAmount.value.toString(),
      accountType: account.type,
      investmentType: investment.category,
    })

    resetToDefaultInvestment()
    void navigate(defiRoute)
  }, [
    investment,
    inputAmount,
    token.decimals,
    token.address,
    providerInfo,
    account.address,
    account.type,
    resetToDefaultInvestment,
    navigate,
    defiRoute,
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

  useEffect(() => {
    if (balance && nonNullable(maxFee)) {
      const tokenDecimals = token.decimals
      const tokenBalance = formatTokenBalance(Infinity, balance, tokenDecimals)

      const deductMaxFeeFromMaxAmount = isEqualAddress(
        token.address,
        nativeFeeToken.address,
      )
      const maxAmount = deductMaxFeeFromMaxAmount ? balance - maxFee : balance
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
    token.address,
    nativeFeeToken.address,
  ])

  const onMaxClick = useCallback(() => {
    setFetchMaxFee(true)
  }, [])

  return (
    <StakingScreen
      onBack={onBack}
      onCancel={onCancel}
      selectedNetworkId={selectedNetworkId}
      isInvalid={disableButton}
      submitButtonError={submitButtonError}
      onSubmit={() => void onSubmit()}
      investment={investment}
      onProviderEdit={onProviderEdit}
      showEditProvider={showEditProvider}
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
              leftText={""}
              rightText={rightText}
              onMaxClick={onMaxClick}
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
