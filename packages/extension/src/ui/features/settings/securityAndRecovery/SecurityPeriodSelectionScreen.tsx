import {
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  NavigationContainer,
  P2,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC, ReactEventHandler } from "react"
import { SettingsMenuItem } from "../ui/SettingsMenuItem"
import { SettingsRadioIcon } from "../ui/SettingsRadioIcon"
import { IS_DEV } from "../../../../shared/utils/dev"

const SECONDS_IN_DAY = 24 * 60 * 60
const SECONDS_IN_MINUTE = 60

const securityPeriodOptions = [
  ...(IS_DEV
    ? [{ value: 15 * SECONDS_IN_MINUTE, label: "15 minutes (Dev only)" }]
    : []),
  { value: 7 * SECONDS_IN_DAY, label: "7 days (recommended)" },
  { value: 14 * SECONDS_IN_DAY, label: "14 days" },
  { value: 30 * SECONDS_IN_DAY, label: "30 days" },
  { value: 60 * SECONDS_IN_DAY, label: "60 days" },
  { value: 90 * SECONDS_IN_DAY, label: "90 days" },
] as const

interface SecurityPeriodSelectionScreenProps {
  onBack: ReactEventHandler
  selectedPeriod?: number
  onSelect: (seconds: number) => void
  onContinue: () => Promise<void>
  isLoading?: boolean
}

export const SecurityPeriodSelectionScreen: FC<
  SecurityPeriodSelectionScreenProps
> = ({ onBack, selectedPeriod, onSelect, onContinue, isLoading }) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Change security period"}
      rightButton={<BarCloseButton />}
    >
      <P2 color="text-secondary" mx="4" mb="2">
        Choose your new security period duration:
      </P2>
      <Flex direction="column" flex={1}>
        <CellStack>
          {securityPeriodOptions.map(({ value, label }) => {
            const checked = selectedPeriod === value
            return (
              <SettingsMenuItem
                key={value}
                title={label}
                onClick={() => onSelect(value)}
                rightIcon={<SettingsRadioIcon checked={checked} />}
              />
            )
          })}
        </CellStack>
        <Button
          position="fixed"
          bottom={4}
          left={4}
          right={4}
          onClick={onContinue}
          size="md"
          colorScheme="primary"
          isDisabled={selectedPeriod === undefined}
          isLoading={isLoading}
        >
          Continue
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
