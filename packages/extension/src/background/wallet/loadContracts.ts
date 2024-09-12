import ArgentAccountSierraUrl from "../../contracts/ArgentAccount.txt"
import ArgentAccountCasmUrl from "../../contracts/ArgentAccount.casm.txt"

export type LoadContracts = (
  derivationPathBase?: string,
) => Promise<[string, string]>

export const loadContracts: LoadContracts = async () =>
  Promise.all(
    [ArgentAccountSierraUrl, ArgentAccountCasmUrl].map((url) =>
      fetch(url).then((res) => res.text()),
    ) as unknown as [string, string],
  )
