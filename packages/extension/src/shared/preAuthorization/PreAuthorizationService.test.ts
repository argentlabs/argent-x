import { describe, expect, test } from "vitest"

import { InMemoryRepository } from "../storage/__new/__test__/inmemoryImplementations"
import { isEqualPreAuthorization, type PreAuthorization } from "./schema"
import { PreAuthorizationService } from "./PreAuthorizationService"

describe("PreAuthorisationService", () => {
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
    const preAuthorisationService = new PreAuthorizationService(
      preAuthorizationRepo,
    )
    return {
      preAuthorisationService,
      preAuthorizationRepo,
    }
  }
  describe("add", () => {
    describe("when valid", () => {
      test("preAuthorisation lifecycle works as expected", async () => {
        const { preAuthorisationService, preAuthorizationRepo } = makeService()

        await preAuthorisationService.add(preAuthorizations[0])
        expect(await preAuthorizationRepo.get()).toEqual([preAuthorizations[0]])

        expect(
          await preAuthorisationService.isPreAuthorized(preAuthorizations[0]),
        ).toBeTruthy()

        expect(
          await preAuthorisationService.isPreAuthorized(preAuthorizations[1]),
        ).toBeFalsy()

        await preAuthorisationService.remove(preAuthorizations[0])

        expect(
          await preAuthorisationService.isPreAuthorized(preAuthorizations[0]),
        ).toBeFalsy()
      })
    })
    describe("when invalid host", () => {
      test("invalid preAutorization host throws an error", async () => {
        const { preAuthorisationService } = makeService()
        await expect(
          preAuthorisationService.add({
            account: {
              address: "0x123",
              networkId: "foo",
            },
            host: "foo",
          }),
        ).rejects.toThrowError("Invalid url")
      })
    })
  })
})
