import Pre9ArgentAccountCompiledContractUrl from "../contracts/ArgentAccount-pre9.txt"
import ArgentAccountCompiledContractUrl from "../contracts/ArgentAccount.txt"
import Pre9ProxyCompiledContractUrl from "../contracts/Proxy-pre9.txt"
import ProxyCompiledContractUrl from "../contracts/Proxy.txt"

export type LoadContracts = () => Promise<[string, string]>

export const loadContracts: LoadContracts = async () =>
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
