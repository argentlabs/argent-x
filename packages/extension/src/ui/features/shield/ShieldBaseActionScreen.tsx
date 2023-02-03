import { BarBackButton, Button, NavigationContainer, icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { ShieldHeader } from "./ui/ShieldHeader"

const { ArgentShieldIcon, ArgentShieldDeactivateIcon } = icons

export interface ShieldBaseActionScreenProps {
  guardian?: string
  onAddOrRemove?: () => void
  isLoading?: boolean
}

export const ShieldBaseActionScreen: FC<ShieldBaseActionScreenProps> = ({
  guardian,
  onAddOrRemove,
  isLoading,
}) => {
  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Argent Shield"}>
      <Flex flexDirection={"column"} flex={1} px={4} pb={4}>
        <ShieldHeader
          icon={guardian ? ArgentShieldDeactivateIcon : ArgentShieldIcon}
          title={`${guardian ? "Remove" : "Add"} Argent Shield`}
          subtitle={`You need to approve a transaction in order to ${
            guardian ? "remove Argent Shield from" : "add Argent Shield to"
          } your account`}
        />
        <Flex flex={1} />
        <Button
          onClick={onAddOrRemove}
          colorScheme={"primary"}
          isLoading={isLoading}
          loadingText={`${guardian ? "Removing" : "Adding"} Argent Shield`}
        >
          {guardian ? "Remove" : "Add"} Argent Shield
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
