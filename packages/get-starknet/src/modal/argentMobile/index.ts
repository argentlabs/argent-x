import type { StarknetWindowObject } from "get-starknet-core"

import { login } from "./login"
import type { IArgentLoginOptions } from "./login"
import { StarknetAdapter } from "./starknet/starknetAdapter"

export type { StarknetWindowObject, IArgentLoginOptions }

export const getStarknetWindowObject = async (
  options: IArgentLoginOptions,
): Promise<StarknetWindowObject> => login(options, StarknetAdapter)
