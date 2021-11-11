import create from "zustand"

interface ProgressStore {
  progress: number
  text: string
  setProgress: (progress: number, text?: string) => void
}

export const useProgress = create<ProgressStore>((set) => ({
  progress: 0,
  text: "",
  setProgress: (progress, text) => {
    if (text) return set({ progress, text })

    return set({ progress })
  },
}))
