import { declareMulticallContract } from "@argent-x/extension/e2e/apis/declareMulticallContract"
import { declareProxyContract } from "@argent-x/extension/e2e/apis/declareProxyContract"
import { universalDeployerDeployContract } from "@argent-x/extension/e2e/apis/universalDeployer"
;(async () => {
  console.log("Declaring Proxy contract...")
  await declareProxyContract()

  console.log("Declaring Multicall contract...")
  const multicallContractClassHash = await declareMulticallContract()
  console.log(`Multicall contract class hash: ${multicallContractClassHash}`)

  if (!multicallContractClassHash) {
    throw "Cannot continue without Multicall contract class hash"
  }

  console.log("Deploying Multicall contract...")
  await universalDeployerDeployContract(multicallContractClassHash)

  console.log(
    "Multicall contract deployed… address should be 0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
  )
})()
