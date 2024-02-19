import { recoveredAtStore } from "../../../shared/recovery/storage"
import { atomFromStore } from "../../views/implementation/atomFromStore"

export const recoveredAtAtom = atomFromStore(recoveredAtStore)
