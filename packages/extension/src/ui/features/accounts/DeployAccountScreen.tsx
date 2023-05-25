import { Button, P3, icons } from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { DeployAccountScreenContainerProps } from "./DeployAccountScreenContainer"
import { StarknetAccountMessage } from "./ui/StarknetAccountMessage"

const { DeployIcon } = icons

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
      icon={<DeployIcon fontSize={"4xl"} />}
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
      <P3>
        In order to sign this transaction you need to first activate your
        account on StarkNet
      </P3>
      <P3 fontWeight={"bold"}>
        Activating an account involves a fee. This is not controlled by ArgentX
      </P3>
    </StarknetAccountMessage>
  )
}
