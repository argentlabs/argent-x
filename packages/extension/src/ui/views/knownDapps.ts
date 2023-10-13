import { knownDappsRepository } from "../../shared/storage/__new/repositories/knownDapp"
import { atomFromRepo } from "./implementation/atomFromRepo"

export const knownDappsAtom = atomFromRepo(knownDappsRepository)
