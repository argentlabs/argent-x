import { ClientAccountService } from "./clientTrpc"

// export interfaces
export type { IAccountService } from "./interface"

// export singletons
export const clientAccountService = new ClientAccountService()
