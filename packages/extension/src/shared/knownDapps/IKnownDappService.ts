import { KnownDapp, KnownDapps } from "@argent/x-shared"

export interface IKnownDappService {
  getDapps: () => Promise<KnownDapps>
  getDappByHost: (host: string) => Promise<KnownDapp | null>
  getDappByContractAddress: (
    contractAddress: string,
  ) => Promise<KnownDapp | null>

  upsert: (dapps: KnownDapps) => Promise<void>
}
