import type { FC } from "react"

import type { WalletAccount } from "../../../shared/wallet.model"
import { SignatureRequestRejectedScreen } from "../actions/SignatureRequestRejectedScreen"
import { ConfirmScreen } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { Circle, VStack } from "@chakra-ui/react"
import { H2, icons, P2, SpacerCell } from "@argent/x-ui"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"

const { WarningCircleSecondaryIcon } = icons

interface MultisigSignatureScreenWarningProps {
  selectedAccount?: WalletAccount
  onReject: () => void
}

export const MultisigSignatureScreenWarning: FC<
  MultisigSignatureScreenWarningProps
> = ({ selectedAccount, onReject }) => {
  return (
    <SignatureRequestRejectedScreen
      onReject={onReject}
      selectedAccount={selectedAccount}
      error={"Off-chain signatures are not yet supported for multisig accounts"}
    />
  )
}

export const MultisigSignatureScreenWarningV2: FC = () => {
  const navigate = useNavigate()

  return (
    <ConfirmScreen
      onSubmit={() => navigate(routes.accountActivity())}
      confirmButtonText="I understand"
      singleButton
    >
      <VStack justify="center" align="center" spacing={8} mt={14}>
        <SpacerCell />
        <Circle size={24} bg="primaryExtraDark.500">
          <WarningCircleSecondaryIcon color="primary.500" fontSize="48px" />
        </Circle>
        <VStack spacing="3">
          <H2 textAlign="center">Action required from other multisig owners</H2>
          <P2 textAlign="center" color="neutrals.200">
            Do not close Argent X or the current dapp until all multisig owners
            have signed
          </P2>
        </VStack>
      </VStack>
    </ConfirmScreen>
  )
}
