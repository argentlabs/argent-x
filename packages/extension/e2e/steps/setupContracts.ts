import { declareMulticallContract } from "../apis/declareMulticallContract"
import { declareProxyContract } from "../apis/declareProxyContract"
import { declareUpgradeContract } from "../apis/declareUpgradeContract"
import { universalDeployerDeployContract } from "../apis/universalDeployer"

export async function setupContracts() {
  await declareProxyContract()

  await declareUpgradeContract()

  const multicallContractClassHash = await declareMulticallContract()
  if (!multicallContractClassHash) {
    throw "Cannot continue without Multicall contract class hash"
  }

  try {
    await universalDeployerDeployContract(multicallContractClassHash)
  } catch (e) {
    console.log("Ingoring UDC deploy error - assuming already deployed")
  }
}
