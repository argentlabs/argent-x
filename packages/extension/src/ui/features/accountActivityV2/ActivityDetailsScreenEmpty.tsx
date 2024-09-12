import { FC } from "react"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import {
  BarBackButton,
  Empty,
  EmptyButton,
  iconsDeprecated,
  useBlockExplorer,
} from "@argent/x-ui"
import { AccountDetailsNavigationContainer } from "../actions/transactionV2/header"

const { ExpandIcon, ActivityIcon } = iconsDeprecated

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
      <Empty icon={<ActivityIcon />} title={`Activity not found`}>
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
