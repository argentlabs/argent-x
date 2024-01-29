import { DeclareContractBackgroundPayload } from "../../../shared/udc/schema"
import {
  DeployContractPayload,
  IUdcService,
} from "../../../shared/udc/service/interface"
import { messageClient } from "../messaging/trpc"
import { z } from "zod"

export class UdcService implements IUdcService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async getConstructorParams(networkId: string, classHash: string) {
    return await this.trpcMessageClient.udc.getConstructorParams.query({
      networkId,
      classHash,
    })
  }

  async deployContract(data: DeployContractPayload) {
    const refinedCalldata = z.array(z.string()).parse(data.constructorCalldata)
    return await this.trpcMessageClient.udc.deployContract.mutate({
      ...data,
      constructorCalldata: refinedCalldata,
    })
  }

  async declareContract(data: DeclareContractBackgroundPayload) {
    return await this.trpcMessageClient.udc.declareContract.mutate(data)
  }
}
