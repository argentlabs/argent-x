import { Network, ColorStatus } from "../../../shared/network"

export interface IBackgroundNetworkService {
  updateStatuses(): Promise<void>
}

export type GetNetworkStatusesFn = (
  networks: Network[],
) => Promise<Record<Network["id"], ColorStatus>>
