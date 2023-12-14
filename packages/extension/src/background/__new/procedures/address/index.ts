import { router } from "../../trpc"
import { getAddressFromDomainNameProcedure } from "./getAddressFromDomainName"
import { parseAddressOrDomainProcedure } from "./parseAddressOrDomain"

export const addressRouter = router({
  getAddressFromDomainName: getAddressFromDomainNameProcedure,
  parseAddressOrDomain: parseAddressOrDomainProcedure,
})
