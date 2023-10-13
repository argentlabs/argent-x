import { describe, expect, test, vi } from "vitest"

import { Network } from "../../../../shared/network"
import { defaultReadonlyNetworks } from "../../../../shared/network/defaults"
import { networkSelector } from "../../../../shared/network/selectors"
import { networksEqual } from "../../../../shared/network/store"
import { InMemoryRepository } from "../../../../shared/storage/__new/__test__/inmemoryImplementations"
import BackgroundNetworkService from "./background"
import { NetworkWithStatus } from "../../../../shared/network/type"

describe("BackgroundNetworkService", () => {
  const makeService = () => {
    const networkRepo = new InMemoryRepository<Network>({
      namespace: "core:allNetworks",
      compare: networksEqual,
    })
    const networkWithStatusRepo = new InMemoryRepository<NetworkWithStatus>({
      namespace: "core:allNetworkStatus",
      compare: networksEqual,
    })
    const getNetworkStatuses = vi.fn()
    const backgroundNetworkService = new BackgroundNetworkService(
      networkRepo,
      networkWithStatusRepo,
      defaultReadonlyNetworks,
      getNetworkStatuses,
    )
    return {
      backgroundNetworkService,
      networkWithStatusRepo,
      getNetworkStatuses,
    }
  }
  test("updateStatuses", async () => {
    const {
      backgroundNetworkService,
      networkWithStatusRepo,
      getNetworkStatuses,
    } = makeService()

    getNetworkStatuses.mockResolvedValueOnce({
      "mainnet-alpha": "ok",
      "goerli-alpha": "degraded",
    })

    await backgroundNetworkService.updateStatuses()
    expect(getNetworkStatuses).toHaveBeenCalled()

    const [ok] = await networkWithStatusRepo.get(
      networkSelector("mainnet-alpha"),
    )
    expect(ok).toHaveProperty("status", "ok")

    const [degraded] = await networkWithStatusRepo.get(
      networkSelector("goerli-alpha"),
    )
    expect(degraded).toHaveProperty("status", "degraded")
  })
})
