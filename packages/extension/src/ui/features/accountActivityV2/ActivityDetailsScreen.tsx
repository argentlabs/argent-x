import { FC, ReactEventHandler } from "react"
import { ActivityDetails, ActivityDetailsProps } from "@argent/x-ui/simulation"
import { BarBackButton } from "@argent/x-ui"
import { AccountDetailsNavigationContainer } from "../actions/transactionV2/header"
import {
  MultisigConfirmationsBanner,
  MultisigConfirmationsBannerProps,
} from "../actions/transaction/MultisigConfirmationsBanner"

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
