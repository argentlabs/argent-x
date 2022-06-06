import Pre9ArgentAccountCompiledContractUrl from "../contracts/ArgentAccount-pre9.txt"
import ArgentAccountCompiledContractUrl from "../contracts/ArgentAccount.txt"
import Pre9ProxyCompiledContractUrl from "../contracts/Proxy-pre9.txt"
import ProxyCompiledContractUrl from "../contracts/Proxy.txt"
import { hasNewDerivationPath } from "../shared/wallet.service"

export type LoadContracts = (
  derivationPathBase?: string,
) => Promise<[string, string]>

export const loadPost9Contracts: LoadContracts = async () =>
  Promise.all(
    [ProxyCompiledContractUrl, ArgentAccountCompiledContractUrl].map(
      async (url) => {
        const response = await fetch(url)
        return response.text()
      },
    ) as unknown as [string, string],
  )

export const loadPre9Contracts: LoadContracts = async () =>
  Promise.all(
    [Pre9ProxyCompiledContractUrl, Pre9ArgentAccountCompiledContractUrl].map(
      async (url) => {
        const response = await fetch(url)
        return response.text()
      },
    ) as unknown as [string, string],
  )

export const loadContracts: LoadContracts = async (derivationPath) => {
  if (hasNewDerivationPath(derivationPath)) {
    return loadPost9Contracts()
  }
  return loadPre9Contracts()
}
