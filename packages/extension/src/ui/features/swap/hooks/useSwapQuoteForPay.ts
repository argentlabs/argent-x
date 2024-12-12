import useSWR from "swr"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import { swapService } from "../../../services/swap"
import { addressSchema } from "@argent/x-shared"

interface IUseSwapQuoteForPay {
  payToken?: Token
  receiveToken?: Token
  sellAmount?: bigint
  buyAmount?: bigint
  account?: BaseWalletAccount
}

export function useSwapQuoteForPay({
  payToken,
  receiveToken,
  sellAmount,
  buyAmount,
  account,
}: IUseSwapQuoteForPay) {
  const {
    data: paySwapQuote,
    isValidating: paySwapQuoteLoading,
    error: paySwapQuoteError,
  } = useSWR(
    [
      "tradeFromPay",
      payToken?.address,
      receiveToken?.address,
      sellAmount,
      buyAmount,
      account?.address,
    ],
    async () => {
      if (!payToken || !receiveToken || (!sellAmount && !buyAmount) || !account)
        return

      const parsedPayTokenAddress = addressSchema.parse(payToken.address)
      const parsedReceiveTokenAddress = addressSchema.parse(
        receiveToken.address,
      )
      const parsedAccountAddress = addressSchema.parse(account.address)

      const trade = await swapService.getSwapQuoteForPay(
        parsedPayTokenAddress,
        parsedReceiveTokenAddress,
        parsedAccountAddress,
        sellAmount?.toString(),
        buyAmount?.toString(),
      )
      return trade
    },
    {
      revalidateOnFocus: true,
      refreshInterval: (RefreshIntervalInSeconds.MEDIUM * 1000) / 2, // 30s
      revalidateIfStale: true,
    },
  )

  return {
    paySwapQuote,
    paySwapQuoteLoading,
    paySwapQuoteError,
  }
}
