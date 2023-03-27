import { ButtonCell, H6, icons } from "@argent/ui"
import { Button, Flex } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { Account } from "../accounts/Account"
import { useMultisigInfo } from "../multisig/hooks/useMultisigInfo"
import { useCurrentNetwork } from "../networks/useNetworks"

const { ExpandIcon, HideIcon, ChevronRightIcon } = icons

export const AccountEditButtonsMultisig = ({
  account,
}: {
  account: Account
}) => {
  const currentNetwork = useCurrentNetwork()
  const navigate = useNavigate()
  const blockExplorerTitle = useBlockExplorerTitle()
  const { multisig } = useMultisigInfo(account)
  const handleHideAccount = async (account: Account) => {
    navigate(routes.accountHideConfirm(account.address))
  }

  return (
    <>
      <ButtonCell
        onClick={() => navigate(routes.multisigOwners(account.address))}
      >
        View owners
      </ButtonCell>
      <Button
        onClick={() => navigate(routes.multisigConfirmations(account.address))}
        width="full"
        rightIcon={<ChevronRightIcon />}
        borderRadius="lg"
        p={4}
      >
        <Flex width="100%" justifyContent="space-between">
          <H6>View confirmations </H6>
          <H6 color="neutrals.200">
            {multisig?.threshold}/{multisig?.signers.length}
          </H6>
        </Flex>
      </Button>
      {account && !account.needsDeploy && (
        <ButtonCell
          onClick={() =>
            account && openBlockExplorerAddress(currentNetwork, account.address)
          }
          rightIcon={<ExpandIcon />}
        >
          View on {blockExplorerTitle}
        </ButtonCell>
      )}
      <ButtonCell
        onClick={() => account && handleHideAccount(account)}
        rightIcon={<HideIcon />}
      >
        Hide account
      </ButtonCell>
    </>
  )
}
