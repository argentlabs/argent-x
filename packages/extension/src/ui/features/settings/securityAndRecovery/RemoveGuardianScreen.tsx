import {
  BarBackButton,
  Button,
  FlowHeader,
  NavigationContainer,
} from "@argent/x-ui"
import { ExpandIcon, NoShieldSecondaryIcon } from "@argent/x-ui/icons"
import { Flex } from "@chakra-ui/react"
import type { FC, ReactEventHandler } from "react"

interface RemoveGuardianScreenProps {
  onBack: ReactEventHandler
  onRemoveGuardian: () => Promise<void>
  isLoading?: boolean
}

export const RemoveGuardianScreen: FC<RemoveGuardianScreenProps> = ({
  onBack,
  onRemoveGuardian,
  isLoading,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Remove guardian"}
    >
      <Flex direction="column" flex={1}>
        <FlowHeader
          icon={NoShieldSecondaryIcon}
          title={"Remove Argent as a guardian"}
          subtitle={`Argent protects your smart account with a guardian, an extra layer of security (2FA). If you lose access to your email and can’t verify 2FA, you can remove the guardian to regain control.`}
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
          onClick={onRemoveGuardian}
          size="md"
          colorScheme="primary"
          isLoading={isLoading}
        >
          Remove guardian
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
