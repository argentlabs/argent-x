import type {
  KnownDapp,
  KnownDapps,
  IKnownDappsBackendService,
} from "@argent/x-shared"
import type { IKnownDappsRepository } from "./storage"
import type { IKnownDappService } from "./IKnownDappService"

export class KnownDappService implements IKnownDappService {
  constructor(
    private readonly knownDappsRepository: IKnownDappsRepository,
    private readonly knownDappsBackendService: IKnownDappsBackendService,
  ) {}

  async getDapps(): Promise<KnownDapps> {
    return await this.knownDappsBackendService.getAll()
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

  async getDappById(dappId: string): Promise<KnownDapp | null> {
    const knownDapps = await this.knownDappsRepository.get()

    const dapp = knownDapps?.find((knownDapp) => knownDapp.dappId === dappId)

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
