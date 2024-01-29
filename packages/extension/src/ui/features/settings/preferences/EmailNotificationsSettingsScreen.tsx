import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  Switch,
} from "@argent/ui"
import { FC, ReactEventHandler } from "react"

interface EmailNotificationsSettingsScreenProps {
  onBack: ReactEventHandler
  isNewsletterEnabled?: boolean
  isAnnouncementsEnabled?: boolean
  onNewsletterChange: (newValue: boolean) => void | Promise<void>
  onAnnouncementsChange: (newValue: boolean) => void | Promise<void>
}

export const EmailNotificationsSettingsScreen: FC<
  EmailNotificationsSettingsScreenProps
> = ({
  onBack,
  isNewsletterEnabled = false,
  isAnnouncementsEnabled = false,
  onNewsletterChange,
  onAnnouncementsChange,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title="Email notifications"
    >
      <CellStack>
        <ButtonCell
          rightIcon={<Switch isChecked isDisabled />}
          extendedDescription="Get notified when there are important changes to Starknet or to your Argent X accounts"
          pointerEvents="none"
        >
          Security alerts (required)
        </ButtonCell>
        <ButtonCell
          rightIcon={
            <Switch isChecked={isAnnouncementsEnabled} pointerEvents="none" />
          }
          extendedDescription="Learn about new Argent features and campaigns"
          onClick={() => void onAnnouncementsChange(!isAnnouncementsEnabled)}
        >
          Argent announcements
        </ButtonCell>
        <ButtonCell
          rightIcon={
            <Switch isChecked={isNewsletterEnabled} pointerEvents="none" />
          }
          extendedDescription="Focused and relevant updates from the wider Ethereum ecosystem"
          onClick={() => void onNewsletterChange(!isNewsletterEnabled)}
        >
          Starknet Newsletter
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
