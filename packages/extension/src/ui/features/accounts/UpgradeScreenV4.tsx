import { Button, P3 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

import { StarknetIcon } from "../../components/Icons/StarknetIcon"
import { StarknetAccountMessage } from "./ui/StarknetAccountMessage"
import { UpgradeScreenV4ContainerProps } from "./UpgradeScreenV4Container"

interface UpgradeScreenV4Props extends UpgradeScreenV4ContainerProps {
  fromAccountTokens: boolean
  onClose: () => void
  onOpenMainnet: ReactEventHandler
  onOpenTestnet: ReactEventHandler
  onUpgrade: ReactEventHandler
  v4UpgradeAvailableOnHiddenMainnet?: boolean
  v4UpgradeAvailableOnMainnet?: boolean
  v4UpgradeAvailableOnTestnet?: boolean
}

export const UpgradeScreenV4: FC<UpgradeScreenV4Props> = ({
  fromAccountTokens,
  onClose,
  onOpenMainnet,
  onOpenTestnet,
  onUpgrade,
  upgradeType,
  v4UpgradeAvailableOnHiddenMainnet,
  v4UpgradeAvailableOnMainnet,
  v4UpgradeAvailableOnTestnet,
}) => {
  const footer =
    upgradeType === "network" ? (
      <Flex direction={"column"} gap={2}>
        {(v4UpgradeAvailableOnMainnet || v4UpgradeAvailableOnHiddenMainnet) && (
          <Button
            colorScheme={"inverted"}
            onClick={onOpenMainnet}
            type="button"
          >
            Go to {!v4UpgradeAvailableOnMainnet ? "hidden " : ""}
            mainnet accounts
          </Button>
        )}
        {v4UpgradeAvailableOnTestnet &&
          (v4UpgradeAvailableOnMainnet || v4UpgradeAvailableOnHiddenMainnet ? (
            <Button onClick={onOpenTestnet} type="button">
              Go to testnet accounts
            </Button>
          ) : (
            <Button
              colorScheme={"inverted"}
              onClick={onOpenTestnet}
              type="button"
            >
              Go to testnet accounts
            </Button>
          ))}
      </Flex>
    ) : (
      <Button colorScheme={"inverted"} onClick={onUpgrade} type="button">
        Upgrade Account
      </Button>
    )
  return (
    <StarknetAccountMessage
      onClose={onClose}
      icon={<StarknetIcon />}
      title={"StarkNet is improving"}
      learnMoreLink={
        "https://medium.com/starkware/starknet-alpha-0-10-0-923007290470"
      }
      footer={footer}
    >
      {upgradeType === "account" && !fromAccountTokens && (
        <P3 fontWeight={"bold"}>
          To do this transaction, you need to first upgrade the account.
        </P3>
      )}
      <P3>
        StarkNet has updated their network with important changes. We require
        you to do a simple upgrade of your accounts to support these changes.
      </P3>
      {upgradeType === "network" && (
        <P3 fontWeight={"bold"}>
          Please upgrade your accounts now as they will soon stop working.
        </P3>
      )}
    </StarknetAccountMessage>
  )
}
