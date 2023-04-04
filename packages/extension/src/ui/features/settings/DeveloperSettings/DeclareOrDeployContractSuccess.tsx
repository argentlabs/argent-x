import {
  BarCloseButton,
  Button,
  CopyTooltip,
  FlowHeader,
  NavigationContainer,
  P3,
  icons,
} from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routes } from "../../../routes"
import { StickyGroup } from "../../actions/DeprecatedConfirmScreen"

const { CopyIcon } = icons

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
        <Flex flex={1} mx={6} mt={6} direction="column" alignItems="center">
          {isDeclare ? (
            <FlowHeader
              title="Contract declared"
              subtitle="Contract declared with class hash:"
              variant="success"
            />
          ) : (
            <FlowHeader
              title="Contract deployed"
              subtitle="Contract deployed with address:"
              variant="success"
            />
          )}
          <Box
            maxW="100%"
            backgroundColor="neutrals.800"
            borderRadius={8}
            textAlign={"center"}
            color={"white50"}
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
              mt="6"
              gap="1"
              size="3xs"
              color={"white50"}
              bg={"transparent"}
              _hover={{ bg: "neutrals.700", color: "text" }}
            >
              <CopyIcon /> Copy
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
            Done
          </Button>
        )}
      </StickyGroup>
    </NavigationContainer>
  )
}
