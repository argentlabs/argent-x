import {
  BarBackButton,
  Button,
  FlowHeader,
  icons,
  NavigationContainer,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

const { WalletSecondaryIcon, ShieldSecondaryIcon } = icons

export interface SmartAccountBaseActionScreenProps {
  guardian?: string
  onAddOrRemove?: () => void
  isLoading?: boolean
}

export const SmartAccountBaseActionScreen: FC<
  SmartAccountBaseActionScreenProps
> = ({ guardian, onAddOrRemove, isLoading }) => {
  const navigate = useNavigate()

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
    >
      <Flex flexDirection={"column"} flex={1} px={4} pb={4}>
        <FlowHeader
          icon={guardian ? WalletSecondaryIcon : ShieldSecondaryIcon}
          title={`${guardian ? "Change to Standard Account" : "Upgrade to Smart Account"}`}
          subtitle={
            guardian ? (
              <>
                You need to remove Argent as a guardian to change back to a
                Standard Account. <br /> This deactivates all Smart Account
                features
              </>
            ) : (
              "You need to add Argent as a guardian to use your Smart Account"
            )
          }
        />
        <Flex flex={1} />
        <Button
          onClick={onAddOrRemove}
          colorScheme={"primary"}
          isLoading={isLoading}
          loadingText={`${guardian ? "Changing" : "Upgrading"} `}
        >
          {guardian ? "Change" : "Upgrade"}
        </Button>
      </Flex>
    </NavigationContainer>
  )
}
