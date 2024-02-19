import { ProvisionStatus } from "./types"

export interface IProvisionService {
  getStatus: () => Promise<ProvisionStatus>
}
