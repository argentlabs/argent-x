import { isEqualAddress } from "../../ui/services/addresses"
import { ArgentAccountType } from "../wallet.model"
import { Network } from "./type"

export function mapImplementationToArgentAccountType(
  implementation: string,
  network: Network,
): ArgentAccountType {
  if (isEqualAddress(implementation, network.accountClassHash?.plugin)) {
    return "plugin"
  }

  if (isEqualAddress(implementation, network.accountClassHash?.plugin)) {
    return "multisig"
  }

  if (isEqualAddress(implementation, network.accountClassHash?.multicall2)) {
    return "multicall2"
  }

  return "standard"
}
