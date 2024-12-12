import { B3, icons } from "@argent/x-ui"
import { Button } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback } from "react"
import type { BaseWalletAccount } from "../../../../../shared/wallet.model"
import type { BigNumberish, Call } from "starknet"
import type { EstimatedFees } from "@argent/x-shared/simulation"
import { useKeyValueStorage } from "../../../../hooks/useStorage"
import { settingsStore } from "../../../../../shared/settings"
import { useAirGapData } from "../../transactionV2/useAirGapData"
import { urlWithQuery } from "@argent/x-shared"
import { useIsLedgerSigner } from "../../../ledger/hooks/useIsLedgerSigner"
import { multisigView } from "../../../multisig/multisig.state"
import { useView } from "../../../../views/implementation/react"

const { QrIcon } = icons

interface AirGapReviewButtonProps {
  selectedAccount?: BaseWalletAccount
  transactions: Call | Call[]
  estimatedFees?: EstimatedFees
  nonce?: BigNumberish
}

export const AirGapReviewButtonContainer: FC<AirGapReviewButtonProps> = ({
  selectedAccount,
  ...rest
}) => {
  const airGapEnabled = useKeyValueStorage(settingsStore, "airGapEnabled")
  const isLedger = useIsLedgerSigner(selectedAccount?.id)
  const multisig = useView(multisigView(selectedAccount))
  if (!airGapEnabled || !isLedger || !multisig) {
    return null
  }
  return <AirGapReviewButton selectedAccount={selectedAccount} {...rest} />
}

const AirGapReviewButton: FC<AirGapReviewButtonProps> = ({
  selectedAccount,
  transactions,
  estimatedFees,
  nonce,
}) => {
  const { data } = useAirGapData(
    selectedAccount,
    transactions,
    estimatedFees,
    nonce,
  )

  const onOpenAirGapReview = useCallback(() => {
    if (!data) return

    const url = urlWithQuery("index.html", {
      goto: "airgap",
      data,
    })
    void chrome.tabs.create({
      url,
    })
  }, [data])

  if (!data) {
    return null
  }

  return (
    <Button
      leftIcon={<QrIcon color="text-subtle" w={3} h={3.5} />}
      variant="ghost"
      _hover={{ bg: "transparent" }}
      onClick={onOpenAirGapReview}
    >
      <B3 color="text-subtle">Review on air-gapped device</B3>
    </Button>
  )
}
