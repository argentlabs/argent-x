import useSWR from "swr"
import { udcService } from "../../../services/udc"

export const useConstructorParams = (
  currentClassHash: string,
  currentNetwork: string,
) => {
  const {
    data: contractClass,
    error,
    isValidating,
  } = useSWR([currentClassHash, currentNetwork], () =>
    udcService.getConstructorParams(currentNetwork, currentClassHash),
  )

  return {
    error,
    isValidating,
    contractClass,
  }
}
