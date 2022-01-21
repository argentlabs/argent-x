import create from "zustand"

import { defaultNetwork } from "../../shared/networks"
import { getLocalhostPort } from "../utils/localhost"

interface AppStore {
  switcherNetworkId: string
  localhostPort: number
  error?: string
  isLoading: boolean
  isFirstRender: boolean
}

export const useAppState = create<AppStore>(() => ({
  switcherNetworkId: defaultNetwork.id,
  localhostPort: getLocalhostPort(),
  isLoading: true,
  isFirstRender: true,
}))
