import { useDebounce } from "@argent/shared"
import {
  BarBackButton,
  CellStack,
  H6,
  NavigationContainer,
  Switch,
} from "@argent/ui"
import { Box, Divider, Flex, SwitchProps, Text } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"

interface CardWithSwitchProps extends SwitchProps {
  title: string
  description: string
}

const CardWithSwitch: FC<CardWithSwitchProps> = ({
  title,
  description,
  ...rest
}: CardWithSwitchProps) => {
  return (
    <Box w="full">
      <Flex
        bgColor="neutrals.800"
        width="full"
        borderTopRadius="lg"
        justifyContent="space-between"
        p={4}
      >
        <H6>{title}</H6>
        <Switch colorScheme="primary" {...rest} />
      </Flex>
      <Divider color="neutrals.900" />
      <Flex
        bgColor="neutrals.800"
        width="full"
        borderBottomRadius="lg"
        justifyContent="space-between"
        p={4}
      >
        <Text>{description}</Text>
      </Flex>
    </Box>
  )
}

type ArgentAccountEmailNotificationsScreenProps = {
  isNewsletterEnabled?: boolean
  isAnnouncementsEnabled?: boolean
  onNewsletterChange: (isEnabled: boolean) => void
  onAnnouncementsChange: (isEnabled: boolean) => void
}
export const ArgentAccountEmailNotificationsScreen = ({
  isNewsletterEnabled = false,
  isAnnouncementsEnabled = false,
  onNewsletterChange,
  onAnnouncementsChange,
}: ArgentAccountEmailNotificationsScreenProps) => {
  const debouncedOnNewsletterChange = useDebounce(onNewsletterChange, 500)
  const debouncedOnAnnouncementsChange = useDebounce(onAnnouncementsChange, 500)
  const onBack = useNavigateReturnToOrBack()

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title="Email alerts"
    >
      <CellStack pt={0}>
        <CardWithSwitch
          title="Security alerts (required)"
          description="Get notified when there are important changes to Starknet or to your Argent X accounts"
          isChecked={true}
          isDisabled={true}
        />
        <CardWithSwitch
          title="Argent announcements"
          description="Learn about new Argent features and campaigns"
          defaultChecked={isAnnouncementsEnabled}
          onChange={(e) => debouncedOnAnnouncementsChange(e.target.checked)}
        />
        <CardWithSwitch
          title="Starknet Newsletter"
          description="Focused and relevant updates from the wider Ethereum ecosystem"
          defaultChecked={isNewsletterEnabled}
          onChange={(e) => debouncedOnNewsletterChange(e.target.checked)}
        />
      </CellStack>
    </NavigationContainer>
  )
}
