import type { Mocked } from "vitest"
import { describe, expect, test, vi } from "vitest"

import type { IHttpService, Token } from "@argent/x-shared"
import type Emittery from "emittery"

import type { IAccountService } from "../../../shared/account/service/accountService/IAccountService"
import type { IActivityStorage } from "../../../shared/activity/types"
import type { IDebounceService } from "../../../shared/debounce"
import type {
  ContractAddress,
  INftsContractsRepository,
} from "../../../shared/nft/store"
import { createScheduleServiceMock } from "../../../shared/schedule/mock"
import {
  InMemoryKeyValueStore,
  InMemoryObjectStore,
} from "../../../shared/storage/__new/__test__/inmemoryImplementations"
import type { ITokenService } from "../../../shared/token/__new/service/ITokenService"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { Wallet } from "../../wallet"
import type { IBackgroundUIService } from "../ui/IBackgroundUIService"
import { ActivityService } from "./ActivityService"
import {
  GuardianChangedActivity,
  MultisigConfigurationUpdatedActivity,
  NewTokenActivity,
  NftActivity,
  type Events,
} from "./IActivityService"

import activities from "../../../shared/activity/__fixtures__/activities.json"
import state from "../../../shared/activity/__fixtures__/state.json"
import type { WalletStorageProps } from "../../wallet/backup/WalletBackupService"
import { getRandomAccountIdentifier } from "../../../shared/utils/accountIdentifier"

describe("ActivityService", () => {
  const makeService = () => {
    const emitter = {
      emit: vi.fn(),
    } as unknown as Emittery<Events>

    const activityStore = new InMemoryObjectStore<IActivityStorage>({
      namespace: "service:activity",
      defaults: {
        modifiedAfter: {},
      },
    })

    const walletStore = new InMemoryKeyValueStore<WalletStorageProps>({
      namespace: "wallet",
    })

    const walletSingleton = {
      getSelectedAccount: vi.fn(),
    } as unknown as Mocked<Wallet>

    const accountService = {
      get: vi.fn(),
    } as unknown as Mocked<IAccountService>

    const tokenService = {
      getTokens: vi.fn(),
    } as unknown as Mocked<ITokenService>

    const nftsContractsRepository = {
      get: vi.fn(),
    } as unknown as Mocked<INftsContractsRepository>

    const httpService = {
      get: vi.fn(),
    } as unknown as Mocked<IHttpService>

    const [, scheduleService] = createScheduleServiceMock()

    const backgroundUIService = {
      emitter: {
        on: vi.fn(),
      },
    } as unknown as IBackgroundUIService

    const debounceService = {} as unknown as IDebounceService

    const activityService = new ActivityService(
      emitter,
      activityStore,
      walletSingleton,
      accountService,
      tokenService,
      nftsContractsRepository,
      httpService,
      scheduleService,
      backgroundUIService,
      debounceService,
      walletStore,
    )
    return {
      emitter,
      activityStore,
      walletSingleton,
      accountService,
      tokenService,
      nftsContractsRepository,
      httpService,
      scheduleService,
      backgroundUIService,
      debounceService,
      activityService,
    }
  }
  test("fetches activities and emits expected events", async () => {
    const {
      emitter,
      activityStore,
      walletSingleton,
      accountService,
      tokenService,
      nftsContractsRepository,
      httpService,
      activityService,
    } = makeService()

    const activityStoreSetSpy = vi.spyOn(activityStore, "set")

    const networkId = "sepolia-alpha"

    const address =
      "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25"

    walletSingleton.getSelectedAccount.mockResolvedValue({
      id: getRandomAccountIdentifier(address),
      address,
      networkId,
    } as WalletAccount)

    accountService.get.mockResolvedValue(
      state.accountAddressesOnNetwork.map(
        (address) =>
          ({
            address,
            networkId,
          }) as WalletAccount,
      ),
    )

    tokenService.getTokens.mockResolvedValue(
      state.tokenAddressesOnNetwork.map(
        (address) =>
          ({
            address,
            networkId,
          }) as Token,
      ),
    )

    nftsContractsRepository.get.mockResolvedValue(
      state.nftAddressesOnNetwork.map(
        (contractAddress) =>
          ({
            contractAddress,
            networkId,
          }) as ContractAddress,
      ),
    )

    httpService.get.mockResolvedValueOnce({ activities })

    await activityService.updateSelectedAccountActivities()

    expect(walletSingleton.getSelectedAccount).toHaveBeenCalled()
    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringMatching(
        /0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25\/activities\?modifiedAfter=0$/,
      ),
    )

    expect(emitter.emit).toHaveBeenCalledWith(NftActivity, {
      accounts: [
        {
          address:
            "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          networkId: "sepolia-alpha",
        },
        {
          address:
            "0xa00018122f54123d4003db254cd2054679d92eeefaa7c2d94c27abb9143b35",
          networkId: "sepolia-alpha",
        },
      ],
      nfts: [
        {
          contractAddress:
            "0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
          networkId: "sepolia-alpha",
        },
      ],
    })

    expect(emitter.emit).toHaveBeenCalledWith(NewTokenActivity, {
      tokens: [
        {
          address:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          networkId: "sepolia-alpha",
        },
      ],
    })

    expect(emitter.emit).toHaveBeenCalledWith(GuardianChangedActivity, [
      {
        address:
          "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        networkId: "sepolia-alpha",
      },
    ])

    expect(emitter.emit).toHaveBeenCalledWith(
      MultisigConfigurationUpdatedActivity,
      [
        {
          address:
            "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          networkId: "sepolia-alpha",
        },
      ],
    )

    expect(activityStoreSetSpy).toHaveBeenLastCalledWith({
      modifiedAfter: {
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25::sepolia-alpha::local_secret::0": 1701964096841,
      },
    })

    // next fetch with modifiedAfter

    httpService.get.mockResolvedValueOnce({ activities: [] })

    await activityService.updateSelectedAccountActivities()

    expect(httpService.get).toHaveBeenLastCalledWith(
      expect.stringMatching(
        /0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25\/activities\?modifiedAfter=1701964096841$/,
      ),
    )
  })
})
