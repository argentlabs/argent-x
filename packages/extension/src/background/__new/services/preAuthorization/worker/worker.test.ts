import { describe, expect, test, vi } from "vitest"

import {
  type PreAuthorization,
  isEqualPreAuthorization,
} from "../../../../../shared/preAuthorization/schema"
import { InMemoryRepository } from "../../../../../shared/storage/__new/__test__/inmemoryImplementations"
import { PreAuthorisationWorker } from "./worker"

describe("PreAuthorisationWorker", () => {
  const preAuthorizations: PreAuthorization[] = [
    {
      account: {
        address: "0x123",
        networkId: "foo",
      },
      host: "http://foo",
    },
    {
      account: {
        address: "0x123",
        networkId: "bar",
      },
      host: "http://bar",
    },
  ]
  const makeService = () => {
    const preAuthorizationRepo = new InMemoryRepository<PreAuthorization>({
      namespace: `core:whitelist`,
      compare: isEqualPreAuthorization,
    })
    const sendMessageToHost = vi.fn()
    const preAuthorisationWorker = new PreAuthorisationWorker(
      preAuthorizationRepo,
      sendMessageToHost,
    )
    return {
      preAuthorisationWorker,
      preAuthorizationRepo,
      sendMessageToHost,
    }
  }
  test("Disconnect dapp", async () => {
    const { preAuthorizationRepo, sendMessageToHost } = makeService()

    /** populate store and validate */
    await preAuthorizationRepo.upsert(preAuthorizations)
    expect(await preAuthorizationRepo.get()).toEqual(preAuthorizations)

    /** remove to invoke disconnection */
    await preAuthorizationRepo.remove(preAuthorizations[0])
    expect(sendMessageToHost).toHaveBeenCalledOnce()
    expect(sendMessageToHost).toHaveBeenCalledWith(
      {
        type: "DISCONNECT_ACCOUNT",
      },
      preAuthorizations[0].host,
    )
    sendMessageToHost.mockReset()

    await preAuthorizationRepo.remove(preAuthorizations[1])
    expect(sendMessageToHost).toHaveBeenCalledOnce()
    expect(sendMessageToHost).toHaveBeenCalledWith(
      {
        type: "DISCONNECT_ACCOUNT",
      },
      preAuthorizations[1].host,
    )
  })
})
