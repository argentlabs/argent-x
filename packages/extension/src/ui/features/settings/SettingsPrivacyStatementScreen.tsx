import { BarBackButton, NavigationContainer } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { PrivacyStatementText } from "../../components/PrivacyStatementText"

export const SettingsPrivacyStatementScreen: FC = () => {
  const navigate = useNavigate()
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title={"Privacy statement"}
    >
      <Flex direction="column" p="4">
        <PrivacyStatementText />
      </Flex>
    </NavigationContainer>
  )
}
