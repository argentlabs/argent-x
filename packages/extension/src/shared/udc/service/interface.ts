import { LegacyContractClass } from "starknet"

export interface IUdcService {
  getConstructorParams(
    networkId: string,
    classHash: string,
  ): Promise<LegacyContractClass>
}
