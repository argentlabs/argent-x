import { httpService } from "../../../../shared/http/singleton"
import { ProvisionService } from "./implementation"

export const provisionService = new ProvisionService(httpService)
