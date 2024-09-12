import { FC } from "react"
import { Button, H6, iconsDeprecated } from "@argent/x-ui"
import { routes } from "../../../../../../shared/ui/routes"
import { useNavigate } from "react-router-dom"
import { Flex } from "@chakra-ui/react"
import { multisigView } from "../../../../multisig/multisig.state"
import { Multisig } from "../../../../multisig/Multisig"
import { useView } from "../../../../../views/implementation/react"
import { WalletAccount } from "../../../../../../shared/wallet.model"

const { ChevronRightIcon } = iconsDeprecated

export const MultisigThresholdButtonContainer: FC<{
  account: WalletAccount
}> = ({ account }) => {
  const navigate = useNavigate()
  const multisig = useView(multisigView(account))

  if (!multisig) {
    return null
  }

  const onClick = () => {
    navigate(routes.multisigConfirmations(account.address))
  }

  return <MultisigThresholdButton onClick={onClick} multisig={multisig} />
}

interface MultisigThresholdButtonProps {
  onClick: () => void
  multisig: Multisig
}

export const MultisigThresholdButton: FC<MultisigThresholdButtonProps> = ({
  onClick,
  multisig,
}) => {
  return (
    <Button
      onClick={onClick}
      width="full"
      rightIcon={<ChevronRightIcon />}
      borderRadius="lg"
      p={4}
    >
      <Flex width="100%" justifyContent="space-between">
        <H6>
          {multisig.needsDeploy ? (
            <>View confirmations</>
          ) : (
            <>Set confirmations</>
          )}
        </H6>
        <H6 color="neutrals.200">
          {multisig.threshold}/{multisig.signers.length}
        </H6>
      </Flex>
    </Button>
  )
}
