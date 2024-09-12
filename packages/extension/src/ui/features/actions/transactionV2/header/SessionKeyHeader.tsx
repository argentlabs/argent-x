import { Flex, FlexProps } from "@chakra-ui/react"
import { TransactionIcon } from "./icon/TransactionIcon"
import { TransactionTitle } from "./TransactionTitle"
import { FC } from "react"
import { useDappDisplayAttributes } from "../../connectDapp/useDappDisplayAttributes"
import { IconDeprecatedKeys } from "@argent/x-ui"

export interface SessionKeyHeaderProps extends FlexProps {
  title?: string
  dappLogoUrl?: string
  subtitle?: string
  iconKey?: IconDeprecatedKeys
  dappHost?: string
}

export const SessionKeyHeader: FC<SessionKeyHeaderProps> = ({
  title,
  dappLogoUrl,
  subtitle,
  iconKey = "NetworkIcon",
  dappHost,
  ...rest
}) => {
  return (
    <Flex
      alignItems={"center"}
      px={4}
      pt={30}
      pb={3}
      gap={4}
      background={
        'linear-gradient(to bottom, rgba(0,0,0,0) 50%, #000000 100%), url("../../../assets/influence.png")'
      }
      backgroundSize="cover"
      backgroundPosition="bottom"
      {...rest}
    >
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
