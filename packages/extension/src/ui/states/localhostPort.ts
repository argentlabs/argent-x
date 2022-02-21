import create from "zustand"
import { persist } from "zustand/middleware"

interface State {
  localhostPort: number
}

export const useLocalhostPort = create<State>(
  persist(
    () => ({
      localhostPort: 5000,
    }),
    { name: "localhostPort" },
  ),
)
