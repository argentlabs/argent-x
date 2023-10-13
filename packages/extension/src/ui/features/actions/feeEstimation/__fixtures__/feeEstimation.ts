import { getParsedFeeError } from "../feeError"
import { FeeEstimationProps } from "../feeEstimation.model"
import { feeToken } from "./feeToken"

const parsedFeeEstimationError1 = getParsedFeeError(
  'Error in the called contract (0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7):\nError at pc=0:104:\nGot an exception while executing a hint.\nCairo traceback (most recent call last):\nUnknown location (pc=0:1678)\nUnknown location (pc=0:1664)\n\nError in the called contract (0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7):\nError at pc=0:9:\nGot an exception while executing a hint.\nCairo traceback (most recent call last):\nUnknown location (pc=0:1351)\nUnknown location (pc=0:1328)\nUnknown location (pc=0:915)\n\nTraceback (most recent call last):\n  File "<hint32>", line 3, in <module>\nAssertionError: assert_not_zero failed: 0 = 0.',
)

export const feeEstimationFixture1: FeeEstimationProps = {
  fee: {
    amount: "210205026034208",
    suggestedMaxFee: "630615078102624",
  },
  feeToken,
  feeTokenBalance: BigInt("9875209405595349"),
  showError: false,
  showEstimateError: false,
  showFeeError: false,
  userClickedAddFunds: false,
}

export const feeEstimationFixture2: FeeEstimationProps = {
  fee: {
    amount: "21020",
    suggestedMaxFee: "63061",
  },
  feeToken,
  feeTokenBalance: BigInt("9875209405595349"),
  showError: false,
  showEstimateError: false,
  showFeeError: false,
  userClickedAddFunds: false,
}

export const feeEstimationFixture3: FeeEstimationProps = {
  fee: {
    amount: "21020",
    suggestedMaxFee: "63061",
  },
  feeToken,
  feeTokenBalance: BigInt("9875209405595349"),
  showError: true,
  showEstimateError: false,
  showFeeError: true,
  userClickedAddFunds: false,
}

export const feeEstimationFixture4: FeeEstimationProps = {
  fee: {
    amount: "21020",
    suggestedMaxFee: "63061",
  },
  feeToken,
  feeTokenBalance: BigInt("9875209405595349"),
  parsedFeeEstimationError: parsedFeeEstimationError1,
  showError: true,
  showEstimateError: true,
  showFeeError: false,
  userClickedAddFunds: false,
}

export const feeEstimationFixture5: FeeEstimationProps = {
  fee: undefined,
  feeToken,
  feeTokenBalance: BigInt("9875209405595349"),
  parsedFeeEstimationError: parsedFeeEstimationError1,
  showError: true,
  showEstimateError: true,
  showFeeError: false,
  userClickedAddFunds: false,
}

export const feeEstimationFixture6: FeeEstimationProps = {
  fee: undefined,
  feeToken,
  feeTokenBalance: BigInt("9875209405595349"),
  parsedFeeEstimationError: parsedFeeEstimationError1,
  showError: true,
  showEstimateError: true,
  showFeeError: true,
  userClickedAddFunds: true,
}
