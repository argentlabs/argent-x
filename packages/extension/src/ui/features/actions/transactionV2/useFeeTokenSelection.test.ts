import type { TokenWithBalance } from "@argent/x-shared"
import {
  ETH_TOKEN_ADDRESS,
  getLatestArgentMultisigClassHash,
  TXV1_MULTISIG_CLASS_HASH,
} from "@argent/x-shared"
import { num } from "starknet"
import { getMockAccount } from "../../../../../test/account.mock"
import { getMockToken } from "../../../../../test/token.mock"
import { useFeeTokenSelection } from "./useFeeTokenSelection"
import { renderHook } from "../../../test/utils"
import { equalToken } from "../../../../shared/token/__new/utils"

describe("useFeeTokenSelection", () => {
  const tokenWithBalance: TokenWithBalance = {
    ...getMockToken({ address: "0x1" }),
    balance: num.toBigInt(1000),
  }

  const ethToken = {
    ...getMockToken({
      address: ETH_TOKEN_ADDRESS,
    }),
    balance: num.toBigInt(1),
  }

  const tokenWithNoBalance = {
    ...getMockToken({ address: "0x2" }),
    balance: num.toBigInt(1),
  }

  it("selects token with balance for upgraded multisig accounts", () => {
    const feeTokens = [tokenWithBalance, tokenWithNoBalance, ethToken].map(
      (ft) => ({
        ...ft,
        balance: ft.balance.toString(),
        account: getMockAccount(),
      }),
    )

    let feeToken = tokenWithBalance
    const setFeeToken = (token: TokenWithBalance) => {
      feeToken = token
    }

    renderHook(() =>
      useFeeTokenSelection({
        isFeeTokenSelectionReady: false,
        setIsFeeTokenSelectionReady: vi.fn(),
        feeToken,
        setFeeToken,
        account: getMockAccount({
          type: "multisig",
          classHash: getLatestArgentMultisigClassHash(),
        }),
        fee: num.toBigInt(100),
        defaultFeeToken: tokenWithBalance,
        feeTokens,
      }),
    )

    expect(equalToken(feeToken, tokenWithBalance)).toBeTruthy()
  })

  it("selects eth token v1 multisig accounts", () => {
    const feeTokens = [tokenWithBalance, tokenWithNoBalance, ethToken].map(
      (ft) => ({
        ...ft,
        balance: ft.balance.toString(),
        account: getMockAccount(),
      }),
    )

    let feeToken = tokenWithBalance
    const setFeeToken = (token: TokenWithBalance) => {
      feeToken = token
    }

    renderHook(() =>
      useFeeTokenSelection({
        isFeeTokenSelectionReady: false,
        setIsFeeTokenSelectionReady: vi.fn(),
        feeToken,
        setFeeToken,
        account: getMockAccount({
          type: "multisig",
          classHash: TXV1_MULTISIG_CLASS_HASH,
        }),
        fee: num.toBigInt(100),
        defaultFeeToken: tokenWithBalance,
        feeTokens,
      }),
    )

    expect(equalToken(feeToken, ethToken)).toBeTruthy()
  })

  it("keeps default fee token if it has enough balance", () => {
    let feeToken = tokenWithBalance
    const setFeeToken = (token: TokenWithBalance) => {
      feeToken = token
    }
    const feeTokens = [tokenWithNoBalance, tokenWithBalance].map((ft) => ({
      ...ft,
      balance: ft.balance.toString(),
      account: getMockAccount(),
    }))

    renderHook(() =>
      useFeeTokenSelection({
        isFeeTokenSelectionReady: false,
        setIsFeeTokenSelectionReady: vi.fn(),
        feeToken,
        setFeeToken,
        account: getMockAccount(),
        fee: num.toBigInt(100),
        defaultFeeToken: tokenWithBalance,
        feeTokens,
      }),
    )
    expect(equalToken(feeToken, tokenWithBalance)).toBeTruthy()
  })

  it("selects the next token with sufficient balance if the default does not have enough", () => {
    let feeToken = ethToken
    const setFeeToken = (token: TokenWithBalance) => {
      feeToken = token
    }
    const feeTokens = [ethToken, tokenWithBalance].map((ft) => ({
      ...ft,
      balance: ft.balance.toString(),
      account: getMockAccount(),
    }))
    renderHook(() =>
      useFeeTokenSelection({
        isFeeTokenSelectionReady: false,
        setIsFeeTokenSelectionReady: vi.fn(),
        feeToken,
        setFeeToken,
        account: getMockAccount(),
        fee: num.toBigInt(100),
        defaultFeeToken: ethToken,
        feeTokens,
      }),
    )
    expect(equalToken(feeToken, tokenWithBalance)).toBeTruthy()
  })

  it("selects the last token if all have insufficient balance", () => {
    let feeToken = ethToken
    const setFeeToken = (token: TokenWithBalance) => {
      feeToken = token
    }
    const feeTokens = [ethToken, tokenWithNoBalance].map((ft) => ({
      ...ft,
      balance: ft.balance.toString(),
      account: getMockAccount(),
    }))
    renderHook(() =>
      useFeeTokenSelection({
        isFeeTokenSelectionReady: false,
        setIsFeeTokenSelectionReady: vi.fn(),
        feeToken,
        setFeeToken,
        account: getMockAccount(),
        fee: num.toBigInt(100),
        defaultFeeToken: ethToken,
        feeTokens,
      }),
    )
    expect(equalToken(feeToken, tokenWithNoBalance)).toBeTruthy()
  })
})
