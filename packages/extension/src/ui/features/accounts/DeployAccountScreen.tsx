import { RocketSecondaryIcon } from "@argent/x-ui/icons"
import { Button, P2 } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import type { DeployAccountScreenContainerProps } from "./deployAccountScreen.model"
import { StarknetAccountMessage } from "./ui/StarknetAccountMessage"

interface DeployAccountScreenProps extends DeployAccountScreenContainerProps {
  onActivate: ReactEventHandler
}

export const DeployAccountScreen: FC<DeployAccountScreenProps> = ({
  onReject,
  onActivate,
}) => {
  return (
    <StarknetAccountMessage
      onClose={onReject}
      icon={<RocketSecondaryIcon fontSize={"4xl"} />}
      iconOutlined
      title={"Your wallet needs to be activated"}
      learnMoreLink={
        "https://medium.com/starkware/starknet-alpha-0-10-0-923007290470"
      }
      footer={
        <Button onClick={onActivate} colorScheme={"inverted"}>
          Activate Account
        </Button>
      }
    >
      <P2>
        In order to sign this transaction you need to first activate your
        account on Starknet
      </P2>
      <P2 fontWeight={"bold"}>
        Activating an account involves a fee. This is not controlled by ArgentX
      </P2>
    </StarknetAccountMessage>
  )
}
