import type { Mocked } from "vitest"
import { describe, expect, test, vi } from "vitest"

import type { Network } from "../../../shared/network"
import { defaultReadonlyNetworks } from "../../../shared/network/defaults"
import { networkSelector } from "../../../shared/network/selectors"
import { networksEqual } from "../../../shared/network/store"
import { InMemoryRepository } from "../../../shared/storage/__new/__test__/inmemoryImplementations"
import BackgroundNetworkService from "./BackgroundNetworkService"
import type { NetworkWithStatus } from "../../../shared/network/type"
import type { IHttpService } from "@argent/x-shared"
import { ETH_TOKEN_ADDRESS } from "../../../shared/network/constants"

describe("BackgroundNetworkService", () => {
  const makeService = () => {
    const networkRepo = new InMemoryRepository<Network>({
      namespace: "core:allNetworks",
      compare: networksEqual,
      defaults: [
        ...defaultReadonlyNetworks,
        {
          id: "katana",
          chainId: "katana",
          name: "Katana",
          rpcUrl: "https://katana.rpc",
          possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
        },
      ],
    })
    const networkWithStatusRepo = new InMemoryRepository<NetworkWithStatus>({
      namespace: "core:allNetworkStatus",
      compare: networksEqual,
    })
    const getNetworkStatuses = vi.fn()
    const httpService = {
      get: getNetworkStatuses,
      post: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
    } as Mocked<IHttpService>
    const backgroundNetworkService = new BackgroundNetworkService(
      networkRepo,
      networkWithStatusRepo,
      defaultReadonlyNetworks,
      httpService,
    )
    return {
      backgroundNetworkService,
      networkWithStatusRepo,
      httpService,
    }
  }
  test(" updateStatuses with valid networks", async () => {
    const { backgroundNetworkService, networkWithStatusRepo, httpService } =
      makeService()

    httpService.get.mockResolvedValueOnce({
      state: "green",
    })

    await backgroundNetworkService.updateStatuses()
    expect(httpService.get).toHaveBeenCalled()

    const [ok] = await networkWithStatusRepo.get(
      networkSelector("mainnet-alpha"),
    )
    expect(ok).toHaveProperty("status", "green")
  })
  test(" updateStatuses with unknown networks", async () => {
    const { backgroundNetworkService, networkWithStatusRepo, httpService } =
      makeService()

    httpService.get.mockResolvedValueOnce({
      state: "whatever",
    })

    await backgroundNetworkService.updateStatuses()
    expect(httpService.get).toHaveBeenCalled()

    const [ok] = await networkWithStatusRepo.get(networkSelector("katana"))
    expect(ok).toHaveProperty("status", "unknown")
  })
})
