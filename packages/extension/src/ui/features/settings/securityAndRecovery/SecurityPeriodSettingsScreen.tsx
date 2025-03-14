import {
  BarBackButton,
  Button,
  FlowHeader,
  NavigationContainer,
} from "@argent/x-ui"
import { PeriodSecondaryIcon, ExpandIcon } from "@argent/x-ui/icons"
import { Flex } from "@chakra-ui/react"
import type { FC, ReactEventHandler } from "react"

interface SecurityPeriodSettingsScreenProps {
  onBack: ReactEventHandler
  onLearnMore: () => void
}

export const SecurityPeriodSettingsScreen: FC<
  SecurityPeriodSettingsScreenProps
> = ({ onBack, onLearnMore }) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Change security period"}
    >
      <Flex direction="column" flex={1}>
        <FlowHeader
          icon={PeriodSecondaryIcon}
          title={"Security period"}
          subtitle={`The security period is the time required to recover your smart
            account if you lose your seed phrase or access to your email. It
            also acts as a safeguard, giving you time to react if your seed
            phrase is stolen and an attacker attempts to remove your guardian.`}
        />

        <Button
          as="a"
          href="https://support.argent.xyz/hc/en-us/articles/9950649206685-2-factor-authentication-2FA-on-Argent-X"
          target="_blank"
          rel="noopener noreferrer"
          variant="link"
          color="text-subtle"
          justifyContent="center"
        >
          Learn more about &quot;Smart Accounts&quot;
          <ExpandIcon color="text-subtle" height={3} width={3} ml={1} />
        </Button>
        <Button
          position="fixed"
          bottom={4}
          left={4}
          right={4}
          onClick={onLearnMore}
          size="md"
          colorScheme="primary"
        >
          Change security period
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
