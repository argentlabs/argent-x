import {
  Call,
  EstimateFeeBulk,
  Invocations,
  ProviderInterface,
  TransactionType,
} from "starknet6"
import { isAccountDeployed } from "../../../accountDeploy"
import type { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import type { WalletAccount } from "../../../../shared/wallet.model"
import type { Wallet } from "../../../wallet"
import type { Address } from "@argent/x-shared"

type Invocation = Invocations[number]

export function callsToInvocation(calls: Call[]): Invocation {
  return {
    type: TransactionType.INVOKE,
    payload: calls,
  }
}

export function estimatedFeesToResponse(
  estimatedFees: EstimateFeeBulk,
  feeTokenAddress: Address,
): EstimatedFees {
  if (estimatedFees.length !== 1 && estimatedFees.length !== 2) {
    throw new Error("estimatedFeesToResponse: length must be 1 or 2")
  }

  const fees: EstimatedFees = {
    transactions: {
      feeTokenAddress,
      amount: 0n,
      pricePerUnit: 0n,
    },
  }

  if (estimatedFees.length === 2) {
    const { gas_consumed, gas_price } = estimatedFees[0]
    if (!gas_consumed || !gas_price) {
      throw new Error(
        "estimatedFeesToResponse: missing gas_consumed or gas_price",
      )
    }

    fees.deployment = {
      feeTokenAddress,
      amount: gas_consumed,
      pricePerUnit: gas_price,
    }
  }

  const { gas_consumed, gas_price } =
    estimatedFees.length === 2 ? estimatedFees[1] : estimatedFees[0]

  if (!gas_consumed || !gas_price) {
    throw new Error(
      "estimatedFeesToResponse: missing gas_consumed or gas_price",
    )
  }

  fees.transactions = {
    feeTokenAddress,
    amount: gas_consumed,
    pricePerUnit: gas_price,
  }

  return fees
}

export async function extendInvocationsByAccountDeploy(
  invocations: Invocations,
  walletAccount: WalletAccount,
  starknetProvider: ProviderInterface,
  wallet: Pick<Wallet, "getAccountDeploymentPayload">,
): Promise<Invocations> {
  // if there's already a deploy account invocation, return
  const deployAccountInvocationIndex = invocations.findIndex(
    (invocation) => invocation.type === TransactionType.DEPLOY_ACCOUNT,
  )
  if (deployAccountInvocationIndex !== -1) {
    return invocations
  }

  // otherwise, check if account is already deployed
  const isDeployed = await isAccountDeployed(
    walletAccount,
    starknetProvider.getClassAt.bind(starknetProvider),
  )
  if (isDeployed) {
    return invocations
  }

  const deployAccountInvocation: Invocations[number] = {
    type: TransactionType.DEPLOY_ACCOUNT,
    payload: await wallet.getAccountDeploymentPayload(walletAccount),
  }

  return [deployAccountInvocation, ...invocations]
}
