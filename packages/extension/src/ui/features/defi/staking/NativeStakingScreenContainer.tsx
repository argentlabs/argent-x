import type { Address, Token, TokenWithBalance } from "@argent/x-shared"
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
import { useParseQuery } from "../../../hooks/useParseQuery"
import {
  useCurrentPathnameWithQuery,
  useRouteAccountDefi,
  useRouteInvestmentId,
} from "../../../hooks/useRoute"
import { stakingService } from "../../../services/staking"
import { formatTokenBalance } from "../../../services/tokens/utils"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { tokenBalancesForAccountAndTokenView } from "../../../views/tokenBalances"
import { selectedNetworkIdView } from "../.././../views/network"
import { useToken } from "../../accountTokens/tokens.state"
import { useFeeTokenBalances } from "../../accountTokens/useFeeTokenBalance"
import { useFeeTokenSelection } from "../../actions/transactionV2/useFeeTokenSelection"
import { useDefaultFeeToken } from "../../actions/useDefaultFeeToken"
import { amountInputSchema } from "../../send/amountInput"
import { TokenAmountInput } from "../../send/TokenAmountInput"
import { useSelectedStrkDelegatedStakingInvestment } from "./hooks/useStrkDelegatedStakingInvestments"
import { NativeStakingScreen } from "./NativeStakingScreen"
import { useNavigateReturnToOr } from "../../../hooks/useNavigateReturnTo"
import { useMaxFeeForStaking } from "./hooks/useMaxFeeForStaking"

const querySchema = z.object({
  amount: amountInputSchema,
})

const formSchema = z.object({
  amount: amountInputSchema,
  isMaxSend: z.boolean(),
})

type FormType = z.infer<typeof formSchema>

export const NativeStakingScreenContainer: FC = () => {
  const account = useView(selectedAccountView)
  const token = useToken({
    address: STRK_TOKEN_ADDRESS,
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
    <GaurdedNativeStakingScreenContainer
      token={token}
      balance={BigInt(tokenWithBalance.balance)}
      account={account}
    />
  )
}

interface GaurdedNativeStakingScreenContainerProps {
  token: Token
  balance: bigint
  account: WalletAccount
}

export const GaurdedNativeStakingScreenContainer: FC<
  GaurdedNativeStakingScreenContainerProps
> = ({ token, balance, account }) => {
  const defaultValues = useParseQuery(querySchema)

  const navigate = useNavigate()
  const defiRoute = useRouteAccountDefi()

  const investmentId = useRouteInvestmentId()

  const [investment, , resetToDefaultInvestment] =
    useSelectedStrkDelegatedStakingInvestment(investmentId)

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

  const defaultFeeToken = useDefaultFeeToken(account)
  const feeTokens = useFeeTokenBalances(account)

  const [feeToken, setFeeToken] = useState<TokenWithBalance>(defaultFeeToken)
  const [isFeeTokenSelectionReady, setIsFeeTokenSelectionReady] =
    useState(false)

  const {
    data: maxFee,
    error: maxFeeError,
    isValidating: maxFeeLoading,
  } = useMaxFeeForStaking({
    feeTokenAddress: feeToken?.address,
    tokenAddress: token.address,
    stakerInfo: investment?.stakerInfo,
    investmentId: investment?.id,
    fetch: fetchMaxFee,
    account,
    balance,
  })

  useFeeTokenSelection({
    isFeeTokenSelectionReady,
    setIsFeeTokenSelectionReady,
    feeToken,
    setFeeToken,
    account,
    fee: maxFee,
    defaultFeeToken,
    feeTokens,
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
    navigate(routes.nativeStakingSelect(returnToWithState))
  }, [inputAmount, navigate, currentPath])

  const onSubmit = useCallback(async () => {
    if (!investment) {
      return
    }
    const parsedAmount = parseAmount(inputAmount, token.decimals)

    await stakingService.stake({
      investmentId: investment.id,
      stakerInfo: investment.stakerInfo,
      accountAddress: account.address as Address,
      tokenAddress: token.address,
      amount: parsedAmount.value.toString(),
      accountType: account.type,
    })

    resetToDefaultInvestment()
    navigate(defiRoute)
  }, [
    investment,
    inputAmount,
    token.decimals,
    token.address,
    account.address,
    account.type,
    navigate,
    defiRoute,
    resetToDefaultInvestment,
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
        feeToken.address,
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
    feeToken.address,
  ])

  const onMaxClick = useCallback(() => {
    setFetchMaxFee(true)
  }, [])

  return (
    <NativeStakingScreen
      onBack={onBack}
      onCancel={onCancel}
      selectedNetworkId={selectedNetworkId}
      isInvalid={disableButton}
      submitButtonError={submitButtonError}
      onSubmit={() => void onSubmit()}
      investment={investment}
      onProviderEdit={onProviderEdit}
      showEditProvider={!investmentId}
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
