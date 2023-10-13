import { KnownDapps } from "./model"

export interface KnownDappsBackendService {
  getAll(): Promise<KnownDapps>
}
