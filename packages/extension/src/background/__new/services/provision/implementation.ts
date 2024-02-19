import { IHttpService } from "@argent/shared"
import { IProvisionService } from "../../../../shared/provision/interface"
import { ProvisionStatus } from "../../../../shared/provision/types"
import { PROVISION_STATUS_ENDPOINT } from "../../../../shared/api/constants"

export class ProvisionService implements IProvisionService {
  constructor(private httpService: IHttpService) {}

  getStatus() {
    if (!PROVISION_STATUS_ENDPOINT) {
      throw new Error("Provision status endpoint not defined")
    }
    return this.httpService.get<ProvisionStatus>(PROVISION_STATUS_ENDPOINT)
  }
}
