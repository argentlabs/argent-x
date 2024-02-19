import { feeTokenPreferenceStore } from "../../shared/feeToken/repository/preference"
import { atomFromStore } from "./implementation/atomFromStore"

export const feeTokenPreferenceAtom = atomFromStore(feeTokenPreferenceStore)
