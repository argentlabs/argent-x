import type { FlexProps } from "@chakra-ui/react"
import { Flex } from "@chakra-ui/react"
import { TransactionIcon } from "./icon/TransactionIcon"
import { TransactionTitle } from "./TransactionTitle"
import type { FC } from "react"
import type { IconKeys } from "@argent/x-ui"
import { useDappDisplayAttributes } from "../../../../services/knownDapps/useDappDisplayAttributes"

export interface TransactionHeaderProps extends FlexProps {
  title?: string
  dappLogoUrl?: string
  subtitle?: string
  iconKey?: IconKeys
  dappHost?: string
}

export const TransactionHeader: FC<TransactionHeaderProps> = ({
  title,
  dappLogoUrl,
  subtitle,
  iconKey = "NetworkSecondaryIcon",
  dappHost,
  ...rest
}) => {
  return (
    <Flex alignItems={"center"} p={4} gap={4} {...rest}>
      {dappHost ? (
        <TransactionIconContainer dappHost={dappHost} />
      ) : (
        <TransactionIcon
          dappLogoUrl={dappLogoUrl}
          iconKey={iconKey}
          boxShadow={"menu"}
          height={12}
          width={12}
          flexShrink={0}
        />
      )}
      {title && (
        <TransactionTitle
          title={title}
          subtitle={subtitle}
          dappHost={dappHost}
        />
      )}
    </Flex>
  )
}

const TransactionIconContainer = ({ dappHost }: { dappHost: string }) => {
  const { iconUrl } = useDappDisplayAttributes(dappHost)

  return (
    <TransactionIcon
      dappLogoUrl={iconUrl}
      boxShadow={"menu"}
      height={12}
      width={12}
      flexShrink={0}
    />
  )
}
