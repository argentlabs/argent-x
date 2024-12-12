import type { FC } from "react"
import { useEffect, useState } from "react"
import { accountMessagingService } from "../../../../services/accountMessaging"
import { Flex } from "@chakra-ui/react"
import {
  BarBackButton,
  Button,
  CopyTooltip,
  icons,
  NavigationContainer,
  P3,
  scrollbarStyle,
} from "@argent/x-ui"

const { CopyPrimaryIcon } = icons

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
          backgroundColor="surface-default"
          rounded="lg"
          border="1px solid"
          borderColor="neutrals.500"
        >
          <P3 w="full" sx={scrollbarStyle}>
            {deploymentData}
          </P3>
        </Flex>
        <CopyTooltip copyValue={deploymentData}>
          <Button
            size="sm"
            bg="neutrals.200"
            _hover={{ bg: "neutrals.100" }}
            leftIcon={<CopyPrimaryIcon />}
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
