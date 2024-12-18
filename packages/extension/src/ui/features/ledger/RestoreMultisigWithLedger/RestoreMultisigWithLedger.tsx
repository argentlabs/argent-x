import type { FC } from "react"
import { useState } from "react"
import { RestoreDetecting } from "./RestoreDetecting"
import { RestoreNotFound } from "./RestoreNotFound"
import type { FoundMultisigData } from "./RestoreFound"
import { RestoreFound } from "./RestoreFound"
import { useOnMountUnsafe } from "../../../hooks/useOnMountUnsafe"
import { useRestoreMultisigWithLedgerCallback } from "../hooks/useRestoreMultisigWithLedgerCallback"

type RestoreState = "DETECTING" | "FOUND" | "NOT_FOUND"

type RestoreMultisigWithLedgerProps = {
  networkId: string
  currentStep: number
  helpLink?: string
  totalSteps: number
}

export const RestoreMultisigWithLedger: FC<RestoreMultisigWithLedgerProps> = ({
  networkId,
  currentStep,
  totalSteps,
}) => {
  const [restoreState, setRestoreState] = useState<RestoreState>("DETECTING")
  const [foundMultisigs, setFoundMultisigs] = useState<FoundMultisigData[]>([])
  const { restoreMultisigWithLedger } =
    useRestoreMultisigWithLedgerCallback(networkId)

  useOnMountUnsafe(() => {
    void restoreMultisigWithLedger().then((multisigs) => {
      if (multisigs.length > 0) {
        setFoundMultisigs(multisigs)
        setRestoreState("FOUND")
      } else {
        setRestoreState("NOT_FOUND")
      }
    })
  })

  return (
    <>
      {restoreState === "DETECTING" && (
        <RestoreDetecting currentStep={currentStep} totalSteps={totalSteps} />
      )}
      {restoreState === "FOUND" && (
        <RestoreFound
          currentStep={currentStep}
          totalSteps={totalSteps}
          foundMultisigs={foundMultisigs}
        />
      )}
      {restoreState === "NOT_FOUND" && (
        <RestoreNotFound currentStep={currentStep} totalSteps={totalSteps} />
      )}
    </>
  )
}
