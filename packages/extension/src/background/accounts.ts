import { useNetworkLogsStore } from "./../ui/features/settings/networkLogs.state"
import ArgentAccountCompiledContractUrl from "../contracts/ArgentAccount.txt"
import ProxyCompiledContractUrl from "../contracts/Proxy.txt"

export type LoadContracts = (
  derivationPathBase?: string,
) => Promise<[string, string]>

export const loadContracts: LoadContracts = async () =>
  Promise.all(
    [ProxyCompiledContractUrl, ArgentAccountCompiledContractUrl].map(
      async (url) => {
        const networkLogs = useNetworkLogsStore.getState().networkLogs
        networkLogs.push({ url, method: "GET" })
        useNetworkLogsStore.setState({ networkLogs })
        localStorage.setItem("networkLogs", JSON.stringify(networkLogs))
        const response = await fetch(url)
        return response.text()
      },
    ) as unknown as [string, string],
  )
