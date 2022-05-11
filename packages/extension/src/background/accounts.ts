import ArgentAccountCompiledContractUrl from "../contracts/ArgentAccount.txt"
import ProxyCompiledContractUrl from "../contracts/Proxy.txt"

export const loadContracts = async () =>
  await Promise.all(
    [ProxyCompiledContractUrl, ArgentAccountCompiledContractUrl].map(
      async (url) => {
        const response = await fetch(url)
        return response.text()
      },
    ) as unknown as [string, string],
  )
