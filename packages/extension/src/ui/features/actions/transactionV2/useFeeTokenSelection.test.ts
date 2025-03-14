import type { TokenWithBalance } from "@argent/x-shared"
import {
  ETH_TOKEN_ADDRESS,
  getLatestArgentMultisigClassHash,
  STRK_TOKEN_ADDRESS,
  TXV1_ACCOUNT_CLASS_HASH,
  TXV3_ACCOUNT_CLASS_HASH,
} from "@argent/x-shared"
import { num } from "starknet"
import { getMockToken } from "../../../../../test/token.mock"
import { useFeeTokenSelection } from "./useFeeTokenSelection"
import { renderHook } from "../../../test/utils"
import { equalToken } from "../../../../shared/token/__new/utils"
import { getMockWalletAccount } from "../../../../../test/walletAccount.mock"
import {
  getMockEstimatedFees,
  getMockPaymasterFee,
} from "../../../../../test/fees.mock"
import { USDC_TOKEN_ADDRESS } from "../../../../shared/network/constants"

describe("useFeeTokenSelection", () => {
  const tokenWithBalance: TokenWithBalance = {
    ...getMockToken({ address: USDC_TOKEN_ADDRESS }),
    balance: num.toBigInt(1000),
  }

  const mockAccount = getMockWalletAccount()

  const ethToken = {
    ...getMockToken({
      address: ETH_TOKEN_ADDRESS,
    }),
    balance: num.toBigInt(1),
  }

  const strkToken = {
    ...getMockToken({
      address: STRK_TOKEN_ADDRESS,
    }),
    balance: num.toBigInt(10),
  }

  it("should use ETH for non-V3 accounts", () => {
    const { result } = renderHook(() =>
      useFeeTokenSelection({
        account: getMockWalletAccount({
          classHash: TXV1_ACCOUNT_CLASS_HASH,
        }),
        fees: getMockEstimatedFees({ txVersion: "1" }),
        defaultFeeToken: tokenWithBalance,
        availableFeeTokens: [tokenWithBalance, ethToken].map((t) => ({
          ...t,
          account: mockAccount,
        })),
      }),
    )

    expect(equalToken(result.current.feeToken, ethToken)).toBeTruthy()
    expect(result.current.isFeeTokenSelectionReady).toBe(true)
  })

  it("should keep default token if it has sufficient balance", () => {
    const { result } = renderHook(() =>
      useFeeTokenSelection({
        account: getMockWalletAccount({
          classHash: TXV3_ACCOUNT_CLASS_HASH,
        }),
        fees: getMockEstimatedFees({
          txVersion: "3",
          nativeFeeOverrides: {
            amount: num.toBigInt(5),
            dataGasConsumed: num.toBigInt(2),
          },
        }),
        defaultFeeToken: strkToken,
        availableFeeTokens: [strkToken, ethToken, tokenWithBalance].map(
          (t) => ({
            ...t,
            account: mockAccount,
          }),
        ),
      }),
    )

    expect(equalToken(result.current.feeToken, strkToken)).toBeTruthy()
    expect(result.current.isFeeTokenSelectionReady).toBe(true)
  })

  it("should switch to token with sufficient balance when default is insufficient", () => {
    const { result } = renderHook(() =>
      useFeeTokenSelection({
        account: getMockWalletAccount({
          classHash: TXV3_ACCOUNT_CLASS_HASH,
        }),
        fees: getMockEstimatedFees({
          txVersion: "3",
          nativeFeeOverrides: { amount: num.toBigInt(10000000000) },
        }),
        defaultFeeToken: strkToken,
        availableFeeTokens: [strkToken, tokenWithBalance, ethToken].map(
          (t) => ({
            ...t,
            account: mockAccount,
          }),
        ),
      }),
    )

    expect(equalToken(result.current.feeToken, tokenWithBalance)).toBeTruthy()
    expect(result.current.isFeeTokenSelectionReady).toBe(true)
  })

  it("should fallback to default token when no tokens have sufficient balance", () => {
    const { result } = renderHook(() =>
      useFeeTokenSelection({
        account: getMockWalletAccount({
          classHash: TXV3_ACCOUNT_CLASS_HASH,
        }),
        fees: getMockEstimatedFees({
          txVersion: "3",
          nativeFeeOverrides: { amount: num.toBigInt(10000000000) },
          paymasterFeeOverrides: { maxFee: num.toBigInt(10000000000) },
        }),
        defaultFeeToken: strkToken,
        availableFeeTokens: [strkToken, tokenWithBalance].map((t) => ({
          ...t,
          account: mockAccount,
        })),
      }),
    )

    expect(equalToken(result.current.feeToken, strkToken)).toBeTruthy()
    expect(result.current.isFeeTokenSelectionReady).toBe(true)
  })

  it("should prioritize tokens in sorted order when selecting alternative", () => {
    const alternativeToken = {
      ...getMockToken({ address: ETH_TOKEN_ADDRESS }),
      balance: num.toBigInt(1500),
    }

    const fees = getMockEstimatedFees({
      txVersion: "3",
      nativeFeeOverrides: { amount: num.toBigInt(10) },
      additionalFees: [
        {
          type: "paymaster",
          transactions: getMockPaymasterFee({
            maxFee: num.toBigInt(10),
            feeTokenAddress: alternativeToken.address,
          }),
        },
      ],
    })

    const tokenWithLessBalance = {
      ...tokenWithBalance,
      balance: num.toBigInt(1),
    }

    const { result } = renderHook(() =>
      useFeeTokenSelection({
        account: getMockWalletAccount({
          classHash: TXV3_ACCOUNT_CLASS_HASH,
        }),
        fees,
        defaultFeeToken: strkToken,
        availableFeeTokens: [
          strkToken,
          tokenWithLessBalance,
          alternativeToken,
        ].map((t) => ({
          ...t,
          account: mockAccount,
        })),
      }),
    )

    expect(equalToken(result.current.feeToken, alternativeToken)).toBeTruthy()
    expect(result.current.isFeeTokenSelectionReady).toBe(true)
  })

  it("should fallback to default token when all available tokens have insufficient balance", () => {
    const { result } = renderHook(() =>
      useFeeTokenSelection({
        account: getMockWalletAccount({
          classHash: getLatestArgentMultisigClassHash(),
        }),
        fees: getMockEstimatedFees({
          txVersion: "3",
          nativeFeeOverrides: { amount: num.toBigInt(10000000000) },
        }),
        defaultFeeToken: tokenWithBalance,
        availableFeeTokens: [tokenWithBalance, ethToken].map((t) => ({
          ...t,
          account: mockAccount,
        })),
      }),
    )

    expect(equalToken(result.current.feeToken, tokenWithBalance)).toBeTruthy()
    expect(result.current.isFeeTokenSelectionReady).toBe(true)
  })
})
