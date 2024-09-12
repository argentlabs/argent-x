import { knownDappsRepository } from "../../shared/knownDapps/storage"
import { atomFromRepo } from "./implementation/atomFromRepo"

export const knownDappsAtom = atomFromRepo(knownDappsRepository)
