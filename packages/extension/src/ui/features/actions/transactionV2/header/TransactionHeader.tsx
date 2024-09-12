import { Flex, FlexProps } from "@chakra-ui/react"
import { TransactionIcon } from "./icon/TransactionIcon"
import { TransactionTitle } from "./TransactionTitle"
import { FC } from "react"
import { useDappDisplayAttributes } from "../../connectDapp/useDappDisplayAttributes"
import { IconDeprecatedKeys } from "@argent/x-ui"

export interface TransactionHeaderProps extends FlexProps {
  title?: string
  dappLogoUrl?: string
  subtitle?: string
  iconKey?: IconDeprecatedKeys
  dappHost?: string
}

export const TransactionHeader: FC<TransactionHeaderProps> = ({
  title,
  dappLogoUrl,
  subtitle,
  iconKey = "NetworkIcon",
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
