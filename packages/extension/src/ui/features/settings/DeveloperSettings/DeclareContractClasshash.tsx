import {
  BarCloseButton,
  Button,
  CopyTooltip,
  H3,
  H6,
  NavigationContainer,
  P3,
  icons,
} from "@argent/ui"
import { Box, Flex, Text } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routes } from "../../../routes"
import { StickyGroup } from "../../actions/ConfirmScreen"

const { TickCircleIcon } = icons

const DeclareContractClasshash: FC = () => {
  const navigate = useNavigate()
  const { classhash } = useParams()

  return (
    <NavigationContainer
      title={"Declare smart contract"}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      {classhash && (
        <Flex flex={1} mx={6} mt={16} direction="column" alignItems="center">
          <Text fontSize="6xl" mb={7}>
            <TickCircleIcon />
          </Text>
          <H3 mb={4}>Contract declared</H3>
          <H6 mb={6}>Contract declared with class hash:</H6>
          <Box
            maxW="100%"
            backgroundColor="neutrals.800"
            borderRadius={8}
            py="4.5"
            px="4.5"
            overflowWrap="break-word"
          >
            <P3>{classhash}</P3>
          </Box>
          <CopyTooltip prompt="Click to copy classhash" copyValue={classhash}>
            <Button
              mt={3}
              size="3xs"
              color={"white50"}
              bg={"transparent"}
              _hover={{ bg: "neutrals.700", color: "text" }}
            >
              copy
            </Button>
          </CopyTooltip>
        </Flex>
      )}
      <StickyGroup>
        <Button
          onClick={() => navigate(routes.settingsSmartContractDeploy())}
          gap="2"
          colorScheme="primary"
          width="100%"
        >
          Go to deployment
        </Button>
      </StickyGroup>
    </NavigationContainer>
  )
}

export { DeclareContractClasshash }
