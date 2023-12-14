import { Button, H2, Input } from "@argent/ui"
import {
  CompiledSierraCasm,
  DeclareContractPayload,
  hash,
  isSierra,
} from "starknet"

import { readFileAsString } from "@argent/shared"
import { Flex } from "@chakra-ui/react"
import { FC, useMemo, useState } from "react"
import { declare, declareAndDeploy } from "../services/wallet.service"
import { Status } from "../types/Status"

interface DeclareProps {
  setTransactionStatus: (status: Status) => void
  setLastTransactionHash: (status: string) => void
}

const Declare: FC<DeclareProps> = ({
  setTransactionStatus,
  setLastTransactionHash,
}) => {
  const [classHash, setClassHash] = useState("")
  const [contract, setContract] = useState<string | null>(null)
  const [casm, setCasm] = useState<CompiledSierraCasm | null>(null)
  const [shouldDeploy, setShouldDeploy] = useState(false)

  const contractIsSierra = useMemo(() => {
    return contract && isSierra(contract)
  }, [contract])

  const handleDeclare = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (!contract) {
        throw new Error("No contract")
      }
      if (!classHash) {
        throw new Error("No class hash")
      }
      const payload: DeclareContractPayload = {
        contract,
        classHash,
      }
      if (casm) {
        payload.casm = casm
        delete payload.classHash
      }
      if (shouldDeploy) {
        const result = await declareAndDeploy(payload)
        console.log(result)
        setLastTransactionHash(result.deploy.transaction_hash)
      } else {
        const result = await declare(payload)
        console.log(result)
        setLastTransactionHash(result.transaction_hash)
      }
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <Flex
      as="form"
      direction="column"
      onSubmit={handleDeclare}
      background="neutrals.700"
      flex={1}
      p="4"
      gap="3"
      borderTopLeftRadius="lg"
      borderBottomLeftRadius="lg"
    >
      <H2>Declare (and deploy)</H2>

      <label htmlFor="contract">Compiled Cairo contract to declare:</label>
      <Input
        id="contract"
        name="contract"
        type="file"
        onChange={async (e) => {
          if (!e.target.files) {
            return
          }
          setCasm(null)

          const file = e.target.files[0]
          const fileAsString = await readFileAsString(file)
          setContract(fileAsString)

          const classHash = hash.computeContractClassHash(fileAsString)
          setClassHash(classHash)
        }}
      />

      <label htmlFor="classHash">ClassHash (calculated automatically):</label>
      <Input
        style={{ width: "100%" }}
        id="classHash"
        name="classHash"
        type="text"
        value={classHash}
        readOnly
      />

      {contractIsSierra && (
        <>
          <label htmlFor="contract">Compiled CASM to declare:</label>
          <Input
            id="casm"
            name="casm"
            type="file"
            onChange={async (e) => {
              if (!e.target.files) {
                return
              }
              const file = e.target.files[0]
              const fileAsString = await readFileAsString(file)
              const fileAsJson = JSON.parse(fileAsString)
              setCasm(fileAsJson)
            }}
          />
        </>
      )}

      <Input
        type="checkbox"
        id="shouldDeploy"
        name="shouldDeploy"
        checked={shouldDeploy}
        onChange={() => setShouldDeploy(!shouldDeploy)}
      />
      <label htmlFor="shouldDeploy">Also deploy</label>

      <Button type="submit" disabled={!contract} colorScheme="inverted">
        {shouldDeploy ? "Declare and Deploy" : "Declare"}
      </Button>
    </Flex>
  )
}

export { Declare }
