import {
  BarCloseButton,
  Button,
  CellStack,
  CopyTooltip,
  FlowHeader,
  NavigationContainer,
  P3,
  icons,
} from "@argent/ui"
import { Box, Center, Flex } from "@chakra-ui/react"
import { FC } from "react"

const { CopyIcon } = icons

interface DeclareOrDeployContractSuccessScreenProps {
  type?: string
  classHashOrDeployedAddress?: string
  onClose: () => void
  onDeployment: () => void
}

export const DeclareOrDeployContractSuccessScreen: FC<
  DeclareOrDeployContractSuccessScreenProps
> = ({ type, classHashOrDeployedAddress, onClose, onDeployment }) => {
  const isDeclare = type === "declare"
  const value = classHashOrDeployedAddress

  return (
    <NavigationContainer
      title={isDeclare ? "Declared smart contract" : "Deployed smart contract"}
      rightButton={<BarCloseButton onClick={onClose} />}
    >
      <CellStack pt={0} flex={1}>
        {value && (
          <Center flexDirection={"column"}>
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
              p="4.5"
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
                _hover={{ bg: "neutrals.700", color: "text.primary" }}
              >
                <CopyIcon /> Copy
              </Button>
            </CopyTooltip>
          </Center>
        )}
        <Flex flex={1} />
        {isDeclare ? (
          <Button w={"full"} onClick={onDeployment} colorScheme="primary">
            Go to deployment
          </Button>
        ) : (
          <Button w={"full"} onClick={onClose} colorScheme="primary">
            Done
          </Button>
        )}
      </CellStack>
    </NavigationContainer>
  )
}
