import { create } from "zustand"
import { persist } from "zustand/middleware"

interface State {
  /** route to restore */
  entryRoute?: {
    pathname: string
    search: string
  }
}

export const useRestorationState = create<State>()(
  persist((_set, _get) => ({}), { name: "restoration" }),
)
