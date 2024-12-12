import { useParams } from "react-router-dom"
import type { FC } from "react"
import { useState } from "react"
import type { LedgerStartContext } from "../../../shared/ledger/schema"
import { ledgerStartContextSchema } from "../../../shared/ledger/schema"
import { LedgerConnectStep } from "./LedgerConnect/LedgerConnectStep"
import { CreateMultisigWithLedger } from "./CreateMultisigWithLedger/CreateMultisigWithLedgerScreen"
import { JoinMultisigWithLedger } from "./JoinMultisigWithLedger/JoinMultisigWithLedger"
import { RestoreMultisigWithLedger } from "./RestoreMultisigWithLedger/RestoreMultisigWithLedger"
import { createAccountTypeSchema } from "../../../shared/wallet.model"
import { ImportLedgerAccountsContainer } from "./ImportLedgerAccounts/ImportLedgerAccountsContainer"
import { ReplaceMultisigOwnerWithLedger } from "./ReplaceMultisigOwnerWithLedger/ReplaceMultisigOwnerWithLedger"
import { LedgerReconnectSuccess } from "./LedgerReconnectSuccess"

const USER_ACCOUNT_HELP_LINK = "https://www.argent.xyz/blog/ledger-argent-user"
const MULTISIG_HELP_LINK = "https://www.argent.xyz/blog/ledger_argent_multisig"

export const LedgerStartScreen: FC = () => {
  const [connected, setConnected] = useState(false)

  const { accountType, ctx, networkId, signerToReplace } = useParams()

  const parsedCtx = ledgerStartContextSchema.safeParse(ctx)
  if (!parsedCtx.success) {
    throw new Error("Invalid ctx query param")
  }
  const safeCtx = parsedCtx.data

  const parsedAccountType = createAccountTypeSchema.safeParse(accountType)
  if (!parsedAccountType.success) {
    throw new Error("Invalid accountType query param")
  }
  const safeAccountType = parsedAccountType.data

  const totalSteps = {
    create: 4,
    join: 2,
    restore: 2,
    replace: 2,
    reconnect: 2,
    import: 3,
  }[safeCtx]

  const helpLink =
    safeAccountType === "standard" ? USER_ACCOUNT_HELP_LINK : MULTISIG_HELP_LINK

  if (!networkId) {
    return <></>
  }

  if (ctx === "replace" && !signerToReplace) {
    return <></>
  }

  if (!connected) {
    return (
      <LedgerConnectStep
        onConnect={() => setConnected(true)}
        currentStep={0}
        totalSteps={totalSteps}
        helpLink={helpLink}
      />
    )
  }

  if (safeCtx === "reconnect") {
    return (
      <LedgerReconnectSuccess
        index={1}
        helpLink={helpLink}
        totalSteps={totalSteps}
        filledIndicator
      />
    )
  }

  return (
    <>
      {safeAccountType === "standard" && (
        <ImportLedgerAccountsContainer
          networkId={networkId}
          currentStep={1}
          userAccountHelpLink={USER_ACCOUNT_HELP_LINK}
          totalSteps={totalSteps}
        />
      )}
      {safeAccountType === "multisig" && (
        <MultisigLedgerFlow
          ctx={safeCtx}
          networkId={networkId}
          helpLink={MULTISIG_HELP_LINK}
          signerToReplace={signerToReplace}
          totalSteps={totalSteps}
        />
      )}
    </>
  )
}

const MultisigLedgerFlow: FC<{
  ctx: LedgerStartContext
  networkId: string
  helpLink?: string
  signerToReplace?: string
  totalSteps: number
}> = ({ ctx, networkId, helpLink, signerToReplace, totalSteps }) => {
  return (
    <>
      {ctx === "create" && (
        <CreateMultisigWithLedger
          networkId={networkId}
          currentStep={1}
          helpLink={helpLink}
          totalSteps={totalSteps}
        />
      )}
      {ctx === "join" && (
        <JoinMultisigWithLedger
          networkId={networkId}
          currentStep={1}
          helpLink={helpLink}
          totalSteps={totalSteps}
        />
      )}
      {ctx === "restore" && (
        <RestoreMultisigWithLedger
          networkId={networkId}
          currentStep={1}
          helpLink={helpLink}
          totalSteps={totalSteps}
        />
      )}
      {ctx === "replace" && (
        <ReplaceMultisigOwnerWithLedger
          networkId={networkId}
          currentStep={1}
          helpLink={helpLink}
          signerToReplace={signerToReplace}
          totalSteps={totalSteps}
        />
      )}
    </>
  )
}
