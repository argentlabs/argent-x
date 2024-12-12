import type { FC, ReactEventHandler } from "react"
import type { ActivityDetailsProps } from "@argent/x-ui/simulation"
import { ActivityDetails } from "@argent/x-ui/simulation"
import { BarBackButton } from "@argent/x-ui"
import type { MultisigConfirmationsBannerProps } from "../actions/transaction/MultisigConfirmationsBanner"
import { MultisigConfirmationsBanner } from "../actions/transaction/MultisigConfirmationsBanner"
import { AccountDetailsNavigationContainer } from "../navigation/AccountDetailsNavigationContainer"

interface ActivityDetailsScreenProps extends ActivityDetailsProps {
  onBack: ReactEventHandler
  multisigBannerProps?: MultisigConfirmationsBannerProps
}

export const ActivityDetailsScreen: FC<ActivityDetailsScreenProps> = ({
  activity,
  networkId,
  multisigBannerProps,
  onBack,
}) => {
  return (
    <AccountDetailsNavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
    >
      <ActivityDetails activity={activity} networkId={networkId} flex={1}>
        {multisigBannerProps && (
          <MultisigConfirmationsBanner {...multisigBannerProps} />
        )}
      </ActivityDetails>
    </AccountDetailsNavigationContainer>
  )
}
