import { Mocked, describe, expect, test, vi } from "vitest"

import { IHttpService, Token } from "@argent/x-shared"
import Emittery from "emittery"

import type { IAccountService } from "../../../../shared/account/service/interface"
import type { IActivityStorage } from "../../../../shared/activity/types"
import type { IDebounceService } from "../../../../shared/debounce"
import { createScheduleServiceMock } from "../../../../shared/schedule/mock"
import {
  InMemoryKeyValueStore,
  InMemoryObjectStore,
} from "../../../../shared/storage/__new/__test__/inmemoryImplementations"
import type {
  ContractAddress,
  INftsContractsRepository,
} from "../../../../shared/storage/__new/repositories/nft"
import type { ITokenService } from "../../../../shared/token/__new/service/interface"
import type { WalletAccount } from "../../../../shared/wallet.model"
import type { Wallet } from "../../../wallet"
import type { IBackgroundUIService } from "../ui/interface"
import { ActivityService } from "./implementation"
import { GuardianChangedActivity, NftActivity, type Events } from "./interface"

import activities from "../../../../shared/activity/__fixtures__/activities.json"
import state from "../../../../shared/activity/__fixtures__/state.json"
import { WalletStorageProps } from "../../../wallet/backup/backup.service"

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

    const networkId = "goerli-alpha"

    walletSingleton.getSelectedAccount.mockResolvedValue({
      address:
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
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
          networkId: "goerli-alpha",
        },
        {
          address:
            "0xa00018122f54123d4003db254cd2054679d92eeefaa7c2d94c27abb9143b35",
          networkId: "goerli-alpha",
        },
      ],
      nfts: [
        {
          contractAddress:
            "0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
          networkId: "goerli-alpha",
        },
      ],
    })

    expect(emitter.emit).toHaveBeenCalledWith(GuardianChangedActivity, [
      {
        address:
          "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        networkId: "goerli-alpha",
      },
    ])

    expect(activityStoreSetSpy).toHaveBeenLastCalledWith({
      modifiedAfter: {
        "goerli-alpha::0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25": 1701964096841,
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
