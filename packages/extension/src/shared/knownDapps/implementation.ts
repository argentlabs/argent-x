import { KnownDapp, KnownDapps, KnownDappsBackendService } from "@argent/shared"
import { IKnownDappsRepository } from "../storage/__new/repositories/knownDapp"
import { IKnownDappService } from "./interface"

export class KnownDappService implements IKnownDappService {
  constructor(
    private readonly knownDappsRepository: IKnownDappsRepository,
    private readonly argentKnownDappsService: KnownDappsBackendService,
  ) {}

  async getDapps(): Promise<KnownDapps> {
    return await this.argentKnownDappsService.getAll()
  }

  async getDappByHost(host: string): Promise<KnownDapp | null> {
    const knownDapps = await this.knownDappsRepository.get()

    const dapp = knownDapps?.find(
      (knownDapp) =>
        knownDapp.dappUrl &&
        new URL(knownDapp.dappUrl).host === new URL(host).host,
    )

    return dapp ?? null
  }

  async getDappByContractAddress(
    contractAddress: string,
  ): Promise<KnownDapp | null> {
    const knownDapps = await this.knownDappsRepository.get()

    const dapp = knownDapps?.find((knownDapp) =>
      knownDapp.contracts?.some(
        (contract) =>
          contract.address === contractAddress && contract.chain === "starknet",
      ),
    )

    return dapp ?? null
  }

  async upsert(dapps: KnownDapps) {
    await this.knownDappsRepository.upsert(dapps)
  }
}
