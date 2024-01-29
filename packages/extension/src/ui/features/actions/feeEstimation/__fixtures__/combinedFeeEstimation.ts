import { ETH_TOKEN_ADDRESS } from "../../../../../shared/network/constants"
import { CombinedFeeEstimationProps } from "../CombinedFeeEstimation"
import { getParsedFeeError } from "../feeError"
import { feeTokenWithBalance } from "./feeToken"

const parsedFeeEstimationError1 = getParsedFeeError(
  'Error in the called contract (0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7):\nError at pc=0:104:\nGot an exception while executing a hint.\nCairo traceback (most recent call last):\nUnknown location (pc=0:1678)\nUnknown location (pc=0:1664)\n\nError in the called contract (0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7):\nError at pc=0:9:\nGot an exception while executing a hint.\nCairo traceback (most recent call last):\nUnknown location (pc=0:1351)\nUnknown location (pc=0:1328)\nUnknown location (pc=0:915)\n\nTraceback (most recent call last):\n  File "<hint32>", line 3, in <module>\nAssertionError: assert_not_zero failed: 0 = 0.',
)

export const combinedFeeEstimationFixture1: CombinedFeeEstimationProps = {
  fee: {
    transactions: {
      amount: 10515252525n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
    deployment: {
      amount: 10515252525n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
  },
  feeToken: feeTokenWithBalance,
  showError: false,
  showEstimateError: false,
  showFeeError: false,
  totalFee: "607064401465260",
  totalMaxFee: "2166875291518356",
  userClickedAddFunds: false,
}

export const combinedFeeEstimationFixture2: CombinedFeeEstimationProps = {
  fee: {
    transactions: {
      amount: 1051n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
    deployment: {
      amount: 1051n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
  },
  feeToken: feeTokenWithBalance,
  showError: false,
  showEstimateError: false,
  showFeeError: false,
  totalFee: "60706",
  totalMaxFee: "216687",
  userClickedAddFunds: false,
}

export const combinedFeeEstimationFixture3: CombinedFeeEstimationProps = {
  fee: {
    transactions: {
      amount: 1051n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
    deployment: {
      amount: 1051n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
  },
  feeToken: feeTokenWithBalance,
  showError: true,
  showEstimateError: false,
  showFeeError: true,
  totalFee: "60706",
  totalMaxFee: "216687",
  userClickedAddFunds: false,
}

export const combinedFeeEstimationFixture4: CombinedFeeEstimationProps = {
  fee: {
    transactions: {
      amount: 1051n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
    deployment: {
      amount: 1051n,
      pricePerUnit: 20n,
      feeTokenAddress: ETH_TOKEN_ADDRESS,
    },
  },
  feeToken: feeTokenWithBalance,
  parsedFeeEstimationError: parsedFeeEstimationError1,
  showError: true,
  showEstimateError: true,
  showFeeError: false,
  userClickedAddFunds: false,
}

export const combinedFeeEstimationFixture5: CombinedFeeEstimationProps = {
  fee: undefined,
  feeToken: feeTokenWithBalance,
  parsedFeeEstimationError: parsedFeeEstimationError1,
  showError: true,
  showEstimateError: true,
  showFeeError: false,
  userClickedAddFunds: false,
}

export const combinedFeeEstimationFixture6: CombinedFeeEstimationProps = {
  fee: undefined,
  feeToken: feeTokenWithBalance,
  parsedFeeEstimationError: parsedFeeEstimationError1,
  showError: true,
  showEstimateError: true,
  showFeeError: true,
  userClickedAddFunds: true,
}
