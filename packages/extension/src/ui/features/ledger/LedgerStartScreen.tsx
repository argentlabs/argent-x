import { useParams } from "react-router-dom"
import { FC, useState } from "react"
import {
  LedgerStartContext,
  ledgerStartContextSchema,
} from "../../../shared/ledger/schema"
import { LedgerConnectStep } from "./LedgerConnect/LedgerConnectStep"
import { CreateMultisigWithLedger } from "./CreateMultisigWithLedger/CreateMultisigWithLedgerScreen"
import { JoinMultisigWithLedger } from "./JoinMultisigWithLedger/JoinMultisigWithLedger"
import { RestoreMultisigWithLedger } from "./RestoreMultisigWithLedger/RestoreMultisigWithLedger"
import { createAccountTypeSchema } from "../../../shared/wallet.model"
import { ImportLedgerAccountsContainer } from "./ImportLedgerAccounts/ImportLedgerAccountsContainer"

const USER_ACCOUNT_HELP_LINK = "https://www.argent.xyz/blog/ledger-argent-user"
const MULTISIG_HELP_LINK = "https://www.argent.xyz/blog/ledger_argent_multisig"

export const LedgerStartScreen: FC = () => {
  const [connected, setConnected] = useState(false)

  const { accountType, ctx, networkId } = useParams()

  if (!networkId) {
    return <></>
  }

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

  if (!connected) {
    return (
      <LedgerConnectStep
        onConnect={() => setConnected(true)}
        currentStep={0}
        totalSteps={4}
        helpLink={
          safeAccountType === "standard"
            ? USER_ACCOUNT_HELP_LINK
            : MULTISIG_HELP_LINK
        }
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
        />
      )}
      {safeAccountType === "multisig" && (
        <MultisigLedgerFlow
          ctx={safeCtx}
          networkId={networkId}
          helpLink={MULTISIG_HELP_LINK}
        />
      )}
    </>
  )
}

const MultisigLedgerFlow: FC<{
  ctx: LedgerStartContext
  networkId: string
  helpLink?: string
}> = ({ ctx, networkId, helpLink }) => {
  return (
    <>
      {ctx === "create" && (
        <CreateMultisigWithLedger
          networkId={networkId}
          currentStep={1}
          helpLink={helpLink}
        />
      )}
      {ctx === "join" && (
        <JoinMultisigWithLedger
          networkId={networkId}
          currentStep={1}
          helpLink={helpLink}
        />
      )}
      {ctx === "restore" && (
        <RestoreMultisigWithLedger
          networkId={networkId}
          currentStep={1}
          helpLink={helpLink}
        />
      )}
    </>
  )
}
