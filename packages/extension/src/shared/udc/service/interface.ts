import { BasicContractClass } from "../../../background/__new/procedures/udc/getConstructorParams"
import { ParameterField } from "../../../ui/features/settings/DeveloperSettings/deploySmartContractForm.model"
import { DeclareContractBackgroundPayload } from "../type"

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
  deployContract(data: DeployContractPayload): Promise<string>
  declareContract(data: DeclareContractBackgroundPayload): Promise<string>
}
