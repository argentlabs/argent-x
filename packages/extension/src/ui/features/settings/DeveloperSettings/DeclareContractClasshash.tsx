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
import { StickyGroup } from "../../actions/DeprecatedConfirmScreen"

const { TickCircleIcon } = icons

export const DeclareOrDeployContractSuccess: FC = () => {
  const navigate = useNavigate()
  const { type, classHashOrDeployedAddress } = useParams()

  const isDeclare = type === "declare"
  const value = classHashOrDeployedAddress

  return (
    <NavigationContainer
      title={isDeclare ? "Declared smart contract" : "Deployed smart contract"}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      {value && (
        <Flex flex={1} mx={6} mt={16} direction="column" alignItems="center">
          <Text fontSize="6xl" mb={7}>
            <TickCircleIcon />
          </Text>
          {isDeclare ? (
            <>
              <H3 mb={4}>Contract declared</H3>
              <H6 mb={6}>Contract declared with class hash:</H6>
            </>
          ) : (
            <>
              <H3 mb={4}>Contract deployed</H3>
              <H6 mb={6}>Contract deployed with address:</H6>
            </>
          )}
          <Box
            maxW="100%"
            backgroundColor="neutrals.800"
            borderRadius={8}
            py="4.5"
            px="4.5"
            overflowWrap="break-word"
          >
            <P3>{value}</P3>
          </Box>
          <CopyTooltip
            prompt={
              isDeclare
                ? "Click to copy classhash"
                : "Click to copy contract address"
            }
            copyValue={value}
          >
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
        {isDeclare ? (
          <Button
            onClick={() => navigate(routes.settingsSmartContractDeploy())}
            gap="2"
            colorScheme="primary"
            width="100%"
          >
            Go to deployment
          </Button>
        ) : (
          <Button
            onClick={() => navigate(routes.accountTokens())}
            gap="2"
            colorScheme="primary"
            width="100%"
          >
            Go to account
          </Button>
        )}
      </StickyGroup>
    </NavigationContainer>
  )
}
