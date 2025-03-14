import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { knownDappsRepository } from "../../shared/knownDapps/storage"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomWithDebugLabel } from "./atomWithDebugLabel"

export const knownDappsAtom = atomFromRepo(knownDappsRepository)

export const knownDappWithId = atomFamily((dappId?: string) => {
  return atomWithDebugLabel(
    atom(async (get) => {
      const knownDapps = await get(knownDappsAtom)
      return knownDapps.find((dapp) => dapp.dappId === dappId)
    }),
    `knownDappWithId-${dappId}`,
  )
})

export const knownDappsWithIds = atomFamily(
  (dappIds: string[] = []) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const knownDapps = await get(knownDappsAtom)
        if (dappIds.length === 0) {
          return []
        }
        return knownDapps.filter((dapp) => dappIds.includes(dapp.dappId))
      }),
      `knownDappsWithIds-${dappIds.join(",")}`,
    ),
  (a, b) => JSON.stringify(a) === JSON.stringify(b),
)
