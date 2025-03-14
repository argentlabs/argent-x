import { ExpandIcon } from "@argent/x-ui/icons"
import { ButtonCell } from "@argent/x-ui"
import type { FC } from "react"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../../../../services/blockExplorer.service"
import { useCurrentNetwork } from "../../../../networks/hooks/useCurrentNetwork"
import type { WalletAccount } from "../../../../../../shared/wallet.model"

export const ViewOnExplorerButtonContainer: FC<{ account: WalletAccount }> = ({
  account,
}) => {
  const blockExplorerTitle = useBlockExplorerTitle()
  const network = useCurrentNetwork()

  const onClick = () => void openBlockExplorerAddress(network, account.address)

  return (
    <ViewOnExplorerButton
      blockExplorerTitle={blockExplorerTitle}
      needsDeploy={!!account.needsDeploy}
      onClick={onClick}
    />
  )
}

interface ViewOnExplorerButtonProps {
  blockExplorerTitle: string
  needsDeploy: boolean
  onClick: () => void
}

export const ViewOnExplorerButton: FC<ViewOnExplorerButtonProps> = ({
  needsDeploy,
  blockExplorerTitle,
  onClick,
}) => {
  return (
    !needsDeploy && (
      <ButtonCell onClick={onClick} rightIcon={<ExpandIcon />}>
        View on {blockExplorerTitle}
      </ButtonCell>
    )
  )
}
