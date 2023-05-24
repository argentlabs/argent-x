import { AllowArray, Call, number } from "starknet"
import { Account as Accountv5, ec } from "starknet5"

import { getProviderv5 } from "../../../shared/network/provider"
import { WalletAccount } from "../../../shared/wallet.model"

export const getEstimatedFeeForMultisigTx = async (
  selectedAccount: WalletAccount,
  transactions: AllowArray<Call>,
  nonce?: number.BigNumberish,
) => {
  const providerV5 = getProviderv5(selectedAccount.network)

  const accountv5 = new Accountv5(
    providerV5,
    selectedAccount.address,
    ec.starkCurve.utils.randomPrivateKey(), // Random private key works cuz we skipValidation is true
  )

  const { suggestedMaxFee, overall_fee } = await accountv5.estimateInvokeFee(
    transactions,
    {
      nonce,
      skipValidate: true,
    },
  )

  return {
    overall_fee: number.toBN(overall_fee.toString()),
    suggestedMaxFee: number.toBN(suggestedMaxFee.toString()),
  }
}
