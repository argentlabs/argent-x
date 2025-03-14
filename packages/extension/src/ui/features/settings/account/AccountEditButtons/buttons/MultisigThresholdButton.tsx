import type { FC } from "react"
import { ChevronRightSecondaryIcon } from "@argent/x-ui/icons"
import { Button, H5 } from "@argent/x-ui"
import { routes } from "../../../../../../shared/ui/routes"
import { useNavigate } from "react-router-dom"
import { Flex } from "@chakra-ui/react"
import { multisigView } from "../../../../multisig/multisig.state"
import { useView } from "../../../../../views/implementation/react"
import type {
  MultisigWalletAccount,
  WalletAccount,
} from "../../../../../../shared/wallet.model"

export const MultisigThresholdButtonContainer: FC<{
  account: WalletAccount
}> = ({ account }) => {
  const navigate = useNavigate()
  const multisig = useView(multisigView(account))

  if (!multisig) {
    return null
  }

  const onClick = () => {
    navigate(routes.multisigConfirmations(account.id))
  }

  return <MultisigThresholdButton onClick={onClick} multisig={multisig} />
}

interface MultisigThresholdButtonProps {
  onClick: () => void
  multisig: MultisigWalletAccount
}

export const MultisigThresholdButton: FC<MultisigThresholdButtonProps> = ({
  onClick,
  multisig,
}) => {
  return (
    <Button
      onClick={onClick}
      width="full"
      rightIcon={<ChevronRightSecondaryIcon />}
      borderRadius="lg"
      p={4}
    >
      <Flex width="100%" justifyContent="space-between">
        <H5>
          {multisig.needsDeploy ? (
            <>View confirmations</>
          ) : (
            <>Set confirmations</>
          )}
        </H5>
        <H5 color="neutrals.200">
          {multisig.threshold}/{multisig.signers.length}
        </H5>
      </Flex>
    </Button>
  )
}
