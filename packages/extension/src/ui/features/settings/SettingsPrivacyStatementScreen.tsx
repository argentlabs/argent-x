import { BarBackButton, NavigationContainer } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { PrivacyStatementText } from "../../components/PrivacyStatementText"

export const SettingsPrivacyStatementScreen: FC = () => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Privacy statement"}
    >
      <Flex direction="column" p="4">
        <PrivacyStatementText />
      </Flex>
    </NavigationContainer>
  )
}
