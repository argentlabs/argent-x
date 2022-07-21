import create from "zustand"

import { NetworkLog } from "../../../shared/networkLog"

interface State {
  networkLogs: NetworkLog[]
  addNetworkLog: (log: NetworkLog) => void
}

export const useNetworkLogsStore = create<State>((set, get) => ({
  networkLogs: [],
  addNetworkLog: (log: NetworkLog) => {
    const networkLogs = get().networkLogs
    networkLogs.push(log)
    return set({
      networkLogs,
    })
  },
}))

export const useNetworkLogs = () =>
  [
    useNetworkLogsStore((state) => state.networkLogs),
    useNetworkLogsStore((state) => state.addNetworkLog),
  ] as const
