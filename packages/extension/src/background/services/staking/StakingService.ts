import type { BuildSellOpts } from "@argent/x-shared"
import {
  type IHttpService,
  type StakerInfo,
  type StrkStakingCalldata,
  type StrkStakingCalldataResponse,
} from "@argent/x-shared"
import urlJoin from "url-join"

import type { IStakingService } from "../../../shared/staking/IStakingService"
import type { StrkStakingCalldataWithAccountType } from "../../../shared/staking/types"
import { sanitizeAccountType } from "../../../shared/utils/sanitizeAccountType"
import type { WalletAccountType } from "../../../shared/wallet.model"
import type { IBackgroundActionService } from "../action/IBackgroundActionService"
import type { IBackgroundInvestmentService } from "../investments/IBackgroundInvestmentService"

export class StakingService implements IStakingService {
  constructor(
    private readonly investmentService: IBackgroundInvestmentService,
    private readonly httpService: IHttpService,
    private readonly actionService: IBackgroundActionService,
  ) {}

  /// Staking
  async getStakeCalldata({
    investmentId,
    accountAddress,
    tokenAddress,
    amount,
  }: StrkStakingCalldata): Promise<StrkStakingCalldataResponse> {
    const url = urlJoin(
      this.investmentService.investmentUrl,
      "investments",
      investmentId,
      "buildBuyCalldata",
    )
    return this.httpService.post(url, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountAddress,
        assets: [
          {
            tokenAddress,
            amount,
          },
        ],
      }),
    })
  }

  async stake(input: StrkStakingCalldataWithAccountType) {
    const { calls } = await this.getStakeCalldata(input)
    const action = await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: calls,
          meta: {
            ampliProperties: this.buildAmpliProperties(
              input.investmentType === "strkDelegatedStaking"
                ? "stake"
                : "liquid stake",
              input.stakerInfo,
              input.accountType,
            ),
          },
        },
      },
      {
        title: "Stake STRK",
        shortTitle: "Stake",
        icon: "InvestSecondaryIcon",
        investment: {
          investmentId: input.investmentId,
          stakingAction: "stake",
          stakerInfo: input.stakerInfo,
          tokenAddress: input.tokenAddress,
          amount: input.amount,
        },
      },
    )
    return action.meta.hash
  }

  // Unstaking
  async getUnstakeCalldata(
    {
      investmentId,
      accountAddress,
      tokenAddress,
      amount,
    }: StrkStakingCalldataWithAccountType,
    opts?: BuildSellOpts,
  ): Promise<StrkStakingCalldataResponse> {
    const url = urlJoin(
      this.investmentService.investmentUrl,
      "investments",
      investmentId,
      "buildSellCalldata",
    )
    return this.httpService.post(url, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountAddress,
        assets: [
          {
            tokenAddress,
            amount,
            useFullBalance: opts?.useFullBalance,
          },
        ],
        subsequentTransaction: opts?.subsequentTransaction,
      }),
    })
  }

  async initiateUnstake(input: StrkStakingCalldataWithAccountType) {
    const { calls } = await this.getUnstakeCalldata(input, {
      useFullBalance: true, // we enforce full balance for unstaking
    })
    const action = await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: calls,
          meta: {
            ampliProperties: this.buildAmpliProperties(
              "initialise withdraw",
              input.stakerInfo,
              input.accountType,
            ),
          },
        },
      },
      {
        title: "Initiate withdraw STRK",
        shortTitle: "Initiate withdraw",
        icon: "ArrowDownPrimaryIcon",
        investment: {
          investmentId: input.investmentId,
          stakingAction: "initiateWithdraw",
          stakerInfo: input.stakerInfo,
          tokenAddress: input.tokenAddress,
          amount: input.amount,
          useFullBalance: true,
        },
      },
    )
    return action.meta.hash
  }

  async unstake(input: StrkStakingCalldataWithAccountType) {
    const { calls } = await this.getUnstakeCalldata(input, {
      subsequentTransaction: true,
    })
    const action = await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: calls,
          meta: {
            ampliProperties: this.buildAmpliProperties(
              "finalise withdraw",
              input.stakerInfo,
              input.accountType,
            ),
          },
        },
      },
      {
        title: "Withdraw STRK",
        shortTitle: "Withdraw",
        icon: "ArrowDownPrimaryIcon",
        investment: {
          investmentId: input.investmentId,
          stakingAction: "withdraw",
          stakerInfo: input.stakerInfo,
          tokenAddress: input.tokenAddress,
          amount: input.amount,
          subsequentTransaction: true,
        },
      },
    )
    return action.meta.hash
  }

  async buildClaimCalldata({
    accountAddress,
    investmentId,
  }: StrkStakingCalldata): Promise<StrkStakingCalldataResponse> {
    const url = urlJoin(
      this.investmentService.investmentUrl,
      "investments",
      investmentId,
      "buildClaimCalldata",
    )
    return this.httpService.post(url, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountAddress }),
    })
  }

  async claim(input: StrkStakingCalldataWithAccountType) {
    const { calls } = await this.buildClaimCalldata(input)
    const action = await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: calls,
          meta: {
            ampliProperties: this.buildAmpliProperties(
              "claim staked rewards",
              input.stakerInfo,
              input.accountType,
            ),
          },
        },
      },
      {
        title: "Claim STRK rewards",
        shortTitle: "Claim",
        icon: "SparkleSecondaryIcon",
        investment: {
          investmentId: input.investmentId,
          stakingAction: "claim",
          stakerInfo: input.stakerInfo,
          tokenAddress: input.tokenAddress,
          amount: input.amount,
        },
      },
    )
    return action.meta.hash
  }

  // Private
  buildAmpliProperties(
    type:
      | "stake"
      | "liquid stake"
      | "claim staked rewards"
      | "initialise withdraw"
      | "finalise withdraw",
    stakerInfo: StakerInfo,
    accountType: WalletAccountType,
  ) {
    return {
      "transaction type": type,
      "staking provider": stakerInfo.name,
      "wallet platform": "browser extension" as const,
      "account type": sanitizeAccountType(accountType),
    }
  }
}
