import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { knownDappsRepository } from "../../shared/knownDapps/storage"
import { atomFromRepo } from "./implementation/atomFromRepo"

export const knownDappsAtom = atomFromRepo(knownDappsRepository)

export const knownDappWithId = atomFamily(
  (dappId?: string) => {
    return atom(async (get) => {
      const knownDapps = await get(knownDappsAtom)
      return knownDapps.find((dapp) => dapp.dappId === dappId)
    })
  },
  (a, b) => a === b,
)
