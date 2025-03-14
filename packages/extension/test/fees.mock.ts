import { ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS } from "@argent/x-shared"
import type {
  EstimatedFeesV2,
  NativeEstimatedFee,
  PaymasterEstimatedFee,
} from "@argent/x-shared/simulation"
import { num } from "starknet"
import { USDC_TOKEN_ADDRESS } from "../src/shared/network/constants"

const getMockNativeFee = (
  txVersion: "1" | "3" = "3",
  overrides?: Partial<NativeEstimatedFee>,
): NativeEstimatedFee => ({
  type: "native",
  amount: num.toBigInt(100),
  pricePerUnit: num.toBigInt(1),
  feeTokenAddress: txVersion === "1" ? ETH_TOKEN_ADDRESS : STRK_TOKEN_ADDRESS,
  dataGasConsumed: num.toBigInt(100),
  dataGasPrice: num.toBigInt(1),
  ...overrides,
})

const getMockPaymasterFee = (
  overrides?: Partial<PaymasterEstimatedFee>,
): PaymasterEstimatedFee => ({
  type: "paymaster",
  maxFee: num.toBigInt(100),
  feeTokenAddress: USDC_TOKEN_ADDRESS,
  overallFee: num.toBigInt(100),
  ...overrides,
})

interface GetMockEstimatedFeesOptions {
  txVersion: "1" | "3"
  nativeFeeOverrides?: Partial<NativeEstimatedFee>
  paymasterFeeOverrides?: Partial<PaymasterEstimatedFee>
  additionalFees?: EstimatedFeesV2[]
}

const getMockEstimatedFees = ({
  txVersion,
  nativeFeeOverrides,
  paymasterFeeOverrides,
  additionalFees,
}: GetMockEstimatedFeesOptions): EstimatedFeesV2[] => [
  {
    type: "native",
    transactions: getMockNativeFee(txVersion, nativeFeeOverrides),
    deployment: undefined,
  },
  {
    type: "paymaster",
    transactions: getMockPaymasterFee(paymasterFeeOverrides),
    deployment: undefined,
  },
  ...(additionalFees ?? []),
]

export { getMockEstimatedFees, getMockNativeFee, getMockPaymasterFee }
