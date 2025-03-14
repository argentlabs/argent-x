import { useAtomValue } from "jotai"
import { IS_DEV } from "../../../shared/utils/dev"
import { useTimedAtomValue } from "./useTimedAtomValue"

const debugAtoms = IS_DEV && process.env.DEBUG_ATOMS === "true"

export const useView = debugAtoms ? useTimedAtomValue : useAtomValue
