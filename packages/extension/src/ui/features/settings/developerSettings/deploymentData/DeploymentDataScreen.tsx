import React, { FC, useEffect, useState } from "react"
import { accountMessagingService } from "../../../../services/accountMessaging"
import { Flex } from "@chakra-ui/react"
import {
  Button,
  icons,
  CopyTooltip,
  P4,
  scrollbarStyle,
  BarBackButton,
  NavigationContainer,
} from "@argent/ui"

const { CopyIcon } = icons

export const DeploymentDataScreen: FC = () => {
  const [deploymentData, setDeploymentData] = useState("")

  useEffect(() => {
    const getDeploymentData = async () => {
      const data = await accountMessagingService.getDeploymentData()
      setDeploymentData(JSON.stringify(data))
    }

    void getDeploymentData()
  }, [])

  return (
    <NavigationContainer leftButton={<BarBackButton />} title="Deployment data">
      <Flex flexDirection="column" gap={4} alignItems="center" w="full">
        <Flex
          w="80%"
          p={4}
          backgroundColor="surface.default"
          rounded="lg"
          border="1px solid"
          borderColor="neutrals.500"
        >
          <P4 w="full" sx={scrollbarStyle}>
            {deploymentData}
          </P4>
        </Flex>
        <CopyTooltip copyValue={deploymentData}>
          <Button
            size="sm"
            bg="neutrals.200"
            _hover={{ bg: "neutrals.100" }}
            leftIcon={<CopyIcon />}
            _dark={{
              bg: "neutrals.600",
              _hover: {
                bg: "neutrals.500",
              },
            }}
          >
            Copy
          </Button>
        </CopyTooltip>
      </Flex>
    </NavigationContainer>
  )
}
