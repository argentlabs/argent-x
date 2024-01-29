import type {
  BasicContractClass,
  DeclareContractBackgroundPayload,
  ParameterField,
} from "../schema"

export type DeployContractPayload = {
  address: string
  networkId: string
  classHash: string
  constructorCalldata: string[] | ParameterField[]
  salt: string
  unique: boolean
}
export interface IUdcService {
  getConstructorParams(
    networkId: string,
    classHash: string,
  ): Promise<BasicContractClass>
  deployContract(data: DeployContractPayload): Promise<void>
  declareContract(data: DeclareContractBackgroundPayload): Promise<string>
}
