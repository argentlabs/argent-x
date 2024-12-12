import type { StrkDelegatedStakingInvestment } from "@argent/x-shared"
import {
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  H5,
  HeaderCell,
  icons,
  NavigationContainer,
  P3Bold,
} from "@argent/x-ui"
import { Flex, HStack, Link } from "@chakra-ui/react"
import type { FC, ReactNode } from "react"

import { InvestmentInfo } from "./InvestmentInfo"
import { StakingWarningBox } from "./StakingWarningBox"

const { ExpandIcon } = icons

interface NativeStakingScreenProps {
  onBack: () => void
  onCancel: () => void
  input: ReactNode
  isInvalid: boolean
  submitButtonError?: string
  onSubmit: () => void
  selectedNetworkId: string
  onProviderEdit?: () => void
  investment?: StrkDelegatedStakingInvestment
  showEditProvider?: boolean
}

export const NativeStakingScreen: FC<NativeStakingScreenProps> = ({
  onBack,
  onCancel,
  input,
  submitButtonError,
  isInvalid,
  onSubmit,
  onProviderEdit,
  investment,
  showEditProvider,
}) => {
  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onBack} />}
        rightButton={<BarCloseButton onClick={onCancel} />}
        title={"Stake STRK"}
      >
        <CellStack pt={0} flex={1} gap={3}>
          <HeaderCell>Stake amount</HeaderCell>
          {input}
          <HeaderCell mt={3}>
            <HStack justify="space-between">
              <H5>Provider</H5>
              {showEditProvider && (
                <P3Bold color="accent-brand" as={Link} onClick={onProviderEdit}>
                  Edit
                </P3Bold>
              )}
            </HStack>
          </HeaderCell>
          <InvestmentInfo investment={investment} />
          <StakingWarningBox />
          <Button
            size={"sm"}
            colorScheme={"transparent"}
            mx={"auto"}
            as={"a"}
            href="https://www.argent.xyz/blog/strk-staking"
            target="_blank"
            color="text-secondary"
            rightIcon={<ExpandIcon />}
          >
            Learn more
          </Button>
          <Flex flex={1} />
          <Button
            colorScheme={submitButtonError ? "error" : "primary"}
            isDisabled={isInvalid}
            onClick={onSubmit}
          >
            {submitButtonError ?? `Stake`}
          </Button>
        </CellStack>
      </NavigationContainer>
    </>
  )
}
