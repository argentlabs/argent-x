import type { FC } from "react"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { ExpandIcon, ActivitySecondaryIcon } from "@argent/x-ui/icons"
import {
  BarBackButton,
  Empty,
  EmptyButton,
  useBlockExplorer,
} from "@argent/x-ui"
import { AccountDetailsNavigationContainer } from "../navigation/AccountDetailsNavigationContainer"

interface ActivityDetailsScreenEmptyProps {
  txHash?: string
  networkId?: string
}

export const ActivityDetailsScreenEmpty: FC<
  ActivityDetailsScreenEmptyProps
> = ({ txHash, networkId }) => {
  const onBack = useNavigateReturnToOrBack()
  const { title, onOpenTransaction } = useBlockExplorer()
  return (
    <AccountDetailsNavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
    >
      <Empty icon={<ActivitySecondaryIcon />} title={`Activity not found`}>
        {txHash && networkId && (
          <EmptyButton
            leftIcon={<ExpandIcon />}
            onClick={() =>
              void onOpenTransaction({
                hash: txHash,
                networkId,
              })
            }
          >
            View on {title}
          </EmptyButton>
        )}
      </Empty>
    </AccountDetailsNavigationContainer>
  )
}
