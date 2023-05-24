import { atomFromRepo } from "../../../ui/views/implementation/atomFromRepo"
import { networksRepository } from "../../storage/__new/repositories/network"

export const networksView = atomFromRepo(networksRepository)
